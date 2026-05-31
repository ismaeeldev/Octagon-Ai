# Octagon AI - Client Testing Guide

Welcome to the Octagon AI testing guide! This document is written specifically for you to test every single feature of the platform, step-by-step. You don't need any technical knowledge to follow along. 

If you find any bugs or have feedback, please take a screenshot and note which step you were on!

---

## 1. The Landing Page
**Goal:** Verify the public face of the app looks great and links work.
1. Go to the homepage (`/` or your live URL).
2. Look at the **Featured Upcoming Event** section. You should see simulated live odds (e.g., Islam Makhachev vs. Arman Tsarukyan).
3. Scroll down to check the **Platform Features** (Elo Rankings, Matchup Lab, AI Betting Edge).
4. Click the **"View Upcoming Events"** button at the top. It should smoothly take you to the Events Directory.

## 2. Authentication (Sign Up & Login)
**Goal:** Verify users can create accounts securely.
1. Click the **"Register"** or **"Sign Up"** button in the top navigation bar.
2. Enter a test name, email (e.g., `test1@example.com`), and a password. Click Register.
3. You should be automatically redirected to the dashboard.
4. Click your profile name in the top right and click **"Sign Out"**.
5. Click **"Login"** in the navigation bar, enter the email and password you just created, and ensure you can log back in successfully.

## 3. The Events Directory
**Goal:** Verify that the platform displays scraped UFC fight cards.
1. Click **"Events"** in the navigation bar.
2. You should see two sections: **Upcoming Events** and **Past Events**.
3. Click on the title or card of any event (e.g., "UFC 305").
4. On the Event Details page, verify you can see the **Fight Card** (a list of all the fighters matched up against each other).
5. Click on any fighter's name on this page to be taken to their profile.

## 4. The Fighter Directory
**Goal:** Verify that the database of fighters, their stats, and search work.
1. Click **"Fighters"** in the navigation bar.
2. You should see a grid of UFC fighters with their weight class, Win/Loss record, and proprietary **Elo Rating**.
3. Use the **Search bar** at the top right to type a famous fighter's name (e.g., "Jones" or "McGregor"). Verify the grid updates to show your search result.
4. Click on a fighter's card.
5. On the Fighter Profile page, check that you can see their **Physical Attributes** (Age, Height, Reach) and **Method of Victory** (KOs, Submissions, Decisions).

## 5. Free vs. Premium Access (Predictions)
**Goal:** Verify that the paywall protects the AI predictions from free users.
1. Make sure you are logged in with your free test account.
2. Click **"Predictions"** in the navigation bar.
3. You should see a list of upcoming fights. 
4. Because you are on a free account, the AI Prediction area should be **Blurred out** with a Lock icon that says "Premium Prediction".
5. Click the **"Unlock Now"** button on the lock overlay. It should take you to the Pricing page.

## 6. Upgrading via Stripe (Pricing)
**Goal:** Verify the checkout process works.
1. On the Pricing page, find the **Premium Tier** ($24.99/mo).
2. Click **"Subscribe Now"**.
3. You will be redirected to the secure Stripe Checkout page.
4. Enter the Stripe Test Credit Card: `4242 4242 4242 4242` with any future expiration date (e.g., `12/30`) and any 3-digit CVC (e.g., `123`).
5. Complete the checkout. You should be redirected back to Octagon AI and see a success message.

## 7. AI Predictions & Matchup Lab (Premium Features)
**Goal:** Verify that Premium users get full access to the AI models.
1. Now that your account is Premium, click **"Predictions"** in the navigation bar again.
2. The locks should be completely gone! You should now see the exact **Win Probability percentages** (e.g., 72% vs 28%) and a detailed **AI Summary** paragraph analyzing the fight.
3. Next, click **"Matchup Lab"** in the navigation bar.
4. Select two fighters to compare. Verify that the system generates a custom breakdown and styling comparison for the two fighters you chose.

## 8. Managing Billing
**Goal:** Verify users can cancel or manage their subscriptions.
1. Click your profile name in the top right corner.
2. Select **"Billing"** or **"Subscription"** from the dropdown menu.
3. Click the button to **"Manage Subscription"**. 
4. This should open the Stripe Customer Portal where you can safely view your invoices or cancel the test plan.

## 9. Background Data Scrapers (Admin Test)
**Goal:** Verify that the system can pull fresh data from the internet.
1. If your developer has provided you with the `CRON_SECRET` password, you can manually trigger the data scrapers to run.
2. Open a new tab in your browser and visit: `https://[YOUR_WEBSITE_URL]/api/cron/sync-fighters?secret=[YOUR_CRON_SECRET]`
3. If it is successful, you will see a text response confirming that fighters are being synced into the database. 

---
**End of Test.** 
If you made it through all 9 steps successfully, the platform is functioning perfectly!