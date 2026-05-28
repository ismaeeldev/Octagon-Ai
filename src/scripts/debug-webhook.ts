import 'dotenv/config';
import { stripe } from "../lib/stripe";

async function main() {
  const subId = "sub_1TbwdsDXJrCdIaN5japw6rlU";
  console.log("Retrieving subscription:", subId);
  const subscription = await stripe.subscriptions.retrieve(subId);
  console.log("Subscription fields:", Object.keys(subscription));
  console.log("current_period_end:", (subscription as any).current_period_end);
  console.log("currentPeriodEnd:", (subscription as any).currentPeriodEnd);
  console.log("Full subscription JSON:", JSON.stringify(subscription, null, 2));
}

main().finally(() => process.exit(0));
