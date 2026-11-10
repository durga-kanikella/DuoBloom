# NEW ME cloud setup

## What's changed
- Adds Supabase email/password authentication. Create one shared account and use the same email/password on both devices.
- Stores the complete NEW ME app state in `public.newme_app_state` in your existing Supabase project.
- Uses Supabase Row Level Security so only the signed-in shared account can read or change its row.
- Adds cloud save calls and Realtime refresh notifications for changes made on another device.
- Starts with empty check-in history and default Settings values (no automatic demo seeding).
- `Load sample inputs & logs` adds exactly 10 demo check-ins dated 1–10 October 2026 for each profile (20 total), and keeps genuine records.
- `Reset demo data` removes only records marked as demo and preserves genuine check-ins and settings.
- `Reset all the data` deletes all app state for the shared account after a confirmation prompt.

## One-time Supabase setup
1. Open your existing project: https://supabase.com/dashboard/project/kkbntqeusndfvoqvgifb
2. Open SQL Editor and create a new query.
3. Paste all contents of `supabase_setup.sql` and click Run.
4. In Authentication > URL Configuration, add your GitHub Pages URL to the allowed redirect URLs if you use email confirmation. For this app, the site URL should be `https://durga-kanikella.github.io` and the redirect URL can be `https://durga-kanikella.github.io/NEW ME/`.
5. In Authentication > Providers > Email, decide whether email confirmation is enabled. If enabled, confirm the account email before signing in.

## Deploy
1. Download/extract this ZIP.
2. Upload the *contents* of the `NEW_ME` folder to the root of your NEW ME GitHub repository, replacing the old app files.
3. Commit and push to the branch/folder configured for GitHub Pages.
4. Open `https://durga-kanikella.github.io/NEW ME/` and choose **Create the shared account** once. Use that same email/password on both devices thereafter.
5. Test a check-in on one device, then verify it appears on the other device.

## Security notes
- `supabase-config.js` contains only the project URL and publishable key. This key is intended for browser apps.
- Never put a `service_role` or secret key in GitHub Pages or any browser JavaScript.
- The SQL enables RLS and restricts each row to `auth.uid() = user_id`.
- The app currently stores one JSON snapshot per shared login. Realtime updates from another device refresh the app to load the latest snapshot. Avoid editing the same item on both devices at the exact same moment; simultaneous writes are last-write-wins.
- This is a personal-use shared-account setup, not a multi-tenant production application.
