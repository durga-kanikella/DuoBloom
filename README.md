# DuoBloom — Couple Wellness Tracker

A mobile-first static frontend starter for GitHub Pages, with a Supabase schema for the future shared backend.

## What works in this preview
- Responsive dashboard with Today, Activity, Food & Hydration, Reports, Goals & Rewards, and Piggy Bank sections
- Clickable habit quests, hydration and protein increments
- Workout and meal logging in browser memory
- Sample daily/weekly/monthly/yearly chart views
- Goal/reward creation and a demo contribution ledger
- Celebration modal with confetti and a dark-mode toggle
- PWA manifest

## Important current limitations
This first starter is a **frontend demo**, not yet a connected production app. Sample data is embedded in `app.js`; entries reset on refresh and are not shared between devices. No real money is collected. Supabase credentials and authenticated CRUD calls must be configured before using real personal data.

## 1. Create the Supabase project
1. Create a new Supabase project named `duobloom`.
2. Save the database password securely.
3. Open **SQL Editor** in Supabase.
4. Paste and run `supabase/schema.sql`.
5. In **Authentication → URL Configuration**, add your GitHub Pages URL to Site URL / Redirect URLs. Example: `https://YOUR_GITHUB_USERNAME.github.io/DuoBloom/`.
6. In **Project Settings → API**, copy the Project URL and publishable key (older projects may label this anon key). Never use the `service_role` key in browser code.

## 2. Publish on GitHub Pages
1. Create a GitHub repository named `DuoBloom` (or use your preferred repo name).
2. Upload all files in this folder, preserving `supabase/schema.sql` in the `supabase` folder.
3. Open **Settings → Pages**.
4. Set **Deploy from a branch**, select `main` and `/ (root)`, then Save.
5. Wait for the deployment workflow/status to complete. Your URL will look like `https://YOUR_GITHUB_USERNAME.github.io/DuoBloom/`.

## 3. Configure Supabase frontend
Edit `config.js` and fill in `supabaseUrl` and `supabasePublishableKey`. Then add the Supabase JS v2 client to `index.html` before your application script. Implement:
- Sign-up / login / logout
- Couple creation and invitation using a verified server-side join flow
- CRUD calls for logs, meals, workouts, goals, rewards and contributions
- Loading, error and empty states
- Report aggregation from saved rows

Do not commit a service-role key. The publishable key is expected to be visible in browser code; RLS must enforce data access.

## Security notes
- Review and test `supabase/schema.sql` policies before production.
- The starter schema includes a membership insert policy intended only for initial development; replace it with a verified invite/join RPC before inviting real users.
- Test with two separate accounts: a user outside the couple must not be able to read or write any of the couple's rows.
- Penalties should be agreed in advance, capped, and waived for approved rest days, illness, injuries and reasonable exceptions.
- The app only records a contribution ledger; it does not initiate payments.

## Files
- `index.html` — app layout
- `styles.css` — responsive design
- `app.js` — demo interactions and client-side state
- `config.js` — safe placeholders for public Supabase config
- `manifest.webmanifest` — installable app metadata
- `supabase/schema.sql` — initial schema and RLS policies
