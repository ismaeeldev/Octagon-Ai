import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

function getCurrentPeriodEnd(subscription: any): Date {
  const seconds = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end;
  if (!seconds) {
    console.warn(`No current_period_end found on subscription ${subscription.id}, defaulting to 30 days from now.`);
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  return new Date(seconds * 1000);
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error("[WEBHOOK_ERROR]", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (!session.subscription) {
        console.error("No subscription on checkout session");
        return new NextResponse("No subscription", { status: 200 });
      }

      const subscription = (await stripe.subscriptions.retrieve(
        session.subscription as string
      )) as Stripe.Subscription;

      const userId = session.metadata?.userId || session.client_reference_id;

      if (!userId) {
        console.error("No userId found in metadata");
        return new NextResponse("No userId found in session", { status: 200 });
      }

      console.log(`Processing checkout.session.completed for user ${userId}`);

      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      const currentPeriodEnd = getCurrentPeriodEnd(subscription);

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { userId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            status: subscription.status,
            currentPeriodEnd,
          },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            status: subscription.status,
            currentPeriodEnd,
          },
        });
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as any;
      
      if (invoice.subscription) {
        const subscription = (await stripe.subscriptions.retrieve(
          invoice.subscription as string
        )) as Stripe.Subscription;

        const currentPeriodEnd = getCurrentPeriodEnd(subscription);

        try {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              status: subscription.status,
              currentPeriodEnd,
            },
          });
          console.log(`Updated subscription ${subscription.id} from invoice`);
        } catch (err: any) {
          if (err.code === "P2025") {
             console.log(`Skipping invoice update, subscription ${subscription.id} not in DB yet.`);
          } else {
             throw err;
          }
        }
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const currentPeriodEnd = getCurrentPeriodEnd(subscription);

      try {
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodEnd,
          },
        });
        console.log(`Updated subscription ${subscription.id} from ${event.type}`);
      } catch (err: any) {
         if (err.code === "P2025") {
             console.log(`Skipping sub update, subscription ${subscription.id} not in DB yet.`);
         } else {
             throw err;
         }
      }
    }

    return new NextResponse("Webhook processed", { status: 200 });
  } catch (error: any) {
    console.error("[WEBHOOK_PROCESSING_ERROR]", error);
    return new NextResponse(`Webhook Processing Error: ${error.message || error}`, { status: 500 });
  }
}
