# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b66a73b2-5867-47f9-ac1f-66b2cb014a04

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b66a73b2-5867-47f9-ac1f-66b2cb014a04) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b66a73b2-5867-47f9-ac1f-66b2cb014a04) and click on Share -> Publish.

## Scheduled publishing worker

Scheduled posts are processed by the `run-scheduled-posts` Supabase Edge Function. Deploy it alongside `publish-post`, then trigger it from GitHub Actions or Supabase cron/pg_net.

```sh
supabase functions deploy publish-post run-scheduled-posts --project-ref qfqowhetrxritoyjzzcz
supabase secrets set SCHEDULED_WORKER_SECRET=<strong-random-secret> --project-ref qfqowhetrxritoyjzzcz
gh secret set SCHEDULED_WORKER_SECRET --repo ajmcgr/trypost
```

The included GitHub Actions workflow runs every five minutes and can also be triggered manually from the Actions tab.

Optional one-minute Supabase cron SQL:

```sql
select cron.schedule(
  'run-scheduled-posts-every-minute',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://qfqowhetrxritoyjzzcz.supabase.co/functions/v1/run-scheduled-posts',
    headers := '{"Content-Type":"application/json","x-scheduler-secret":"<strong-random-secret>"}'::jsonb,
    body := '{"batchSize":10}'::jsonb
  );
  $$
);
```

## Billing setup

Apply the database migrations and deploy the billing functions before enabling paid upgrades:

```sh
supabase link --project-ref qfqowhetrxritoyjzzcz
supabase db push
supabase functions deploy create-checkout-session --project-ref qfqowhetrxritoyjzzcz
supabase functions deploy customer-portal --project-ref qfqowhetrxritoyjzzcz
supabase functions deploy stripe-webhook --project-ref qfqowhetrxritoyjzzcz
```

Create monthly and yearly Stripe prices for the Pro and Business products, then configure these Supabase secrets:

```sh
supabase secrets set \
  STRIPE_SECRET_KEY=<stripe-secret-key> \
  STRIPE_WEBHOOK_SECRET=<stripe-webhook-signing-secret> \
  STRIPE_PRO_MONTHLY_PRICE_ID=<price-id> \
  STRIPE_PRO_YEARLY_PRICE_ID=<price-id> \
  STRIPE_BUSINESS_MONTHLY_PRICE_ID=<price-id> \
  STRIPE_BUSINESS_YEARLY_PRICE_ID=<price-id> \
  --project-ref qfqowhetrxritoyjzzcz
```

Point the Stripe webhook at `https://qfqowhetrxritoyjzzcz.supabase.co/functions/v1/stripe-webhook` and subscribe it to `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
