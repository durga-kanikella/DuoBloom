# NEW ME — GitHub Pages prototype

A playful, mobile-friendly wellness tracker for two profiles. Branding is updated to **NEW ME** and the footer reads **made with love by JP · GROW AT YOUR OWN PACE ♡**.

## Included
- Main dashboard focuses on current-day data and shows both profiles side by side.
- Removed the redundant separate End-of-Day Check-in activity/history section; check-in is a single workflow.
- Select any date (including past dates), load saved answers, view and edit, then save. First-recorded and last-updated timestamps are kept separately.
- Recent activity can be filtered by profile, date range, and XP / no-XP / rest activity. Each input appears on its own line.
- Daily, weekly, biweekly, monthly (30 days), yearly (365 days), and custom reports compare both profiles side by side.
- Dashboard profile cards stack vertically for mobile readability and show today XP, monthly check-ins, gym days, successful days, and piggy-bank balance. Streaks are removed from the dashboard.
- XP pass rule: maximum available daily XP minus the configurable deduction. For example, maximum 100 minus 20 = 80; 80 passes and anything below 80 is a lost day.
- Settings for targets, XP per category, gym duration/activity options, no-XP optional habits, and configurable cadence/milestone values.

## Run / deploy
Upload the contents of this folder to the root of a GitHub repository, enable GitHub Pages from `main` / root, then open the Pages URL.

## Important
This is a browser-local prototype using localStorage. It does **not** yet sync between two devices. Shared cross-device use needs Supabase Auth, database tables, membership, and tested Row Level Security. No Supabase secret/service-role key should be put in client-side code. Consequence/deposit tracking and full reward settlement workflows also need production hardening before real-world use.


## Latest update (v5)
- Recent activity and profile history use compact one-line habit rows with first-recorded and last-updated timestamps.
- Added explicit "Not today" choices for tracked categories and Yes / No / Not today for protein, fibre and food choices. Gym has a rest-day option.
- XP reports now include consistency bars, previous-period comparison, and personalized improvement suggestions.
- Profile cards use woman/man icons.
- Pet House includes a month selector for the current and past monthly breeds, an illustrated emoji dog with accessory overlays, and each profile's own item collection.
- Important: a shared URL alone cannot synchronize different devices. Shared simultaneous edits require a backend (e.g. Supabase) with a common database and appropriate access controls. This prototype remains localStorage-based.
\n\n## Demo data persistence fix\n- On startup, if both profiles have no saved check-ins, the app seeds a sample dataset automatically and saves it to browser localStorage.\n- The Settings status reports the number of saved logs for Her and Him.\n- The reset button now restores the demo dataset rather than leaving the app empty.\n- Existing non-empty saved logs are preserved on startup; sample loading manually replaces the local demo dataset.\n

## v6 update — 3D pets, separate boutiques, side-by-side logs
- **Pet House is now split: Her | Him.** Each profile has its own 3D pup, its own boutique (with its own item-type filter), its own XP wallet and its own wardrobe.
- **3D pup (`pet3d.js`, Three.js r128 from cdnjs).** A procedural, lit, shadowed 3D dog with a different breed look each month. Drag to rotate, double-tap to reset. Needs an internet connection and WebGL; otherwise an emoji fallback is shown.
- **Buy = wear.** Every shop item is a real 3D model attached to the dog and items stack: buy a chain, then a bell, and the pup wears a chain *and* a bell that swings. New item: **Jingle bell**. Items: chain, collar, bell, specs, belt, earrings, crown, bone, ball, dress, hoodie (gold / silver / bronze finishes).
- **Wallet** = all XP earned from saved check-ins minus what that profile has spent, so edits to past check-ins keep the wallet consistent.
- **Dashboard → Recent activity** is now two columns (Her | Him), each with its own From / To / Activity filters, a day counter and "Show more".
- Fixed: Settings crashed on load (`stepsTarget` vs `stepTarget` element id), which stopped the dashboard from rendering.
- Fixed: Recent activity listed "Avoided maida/junk" as missed XP even when all food choices were Yes; food is now one line, and optional habits are "done" only when marked Yes.

## v7 update
- Her/Him tabs removed; **Recent logs** is its own tab. Dashboard: profile cards on top, hero below, then monthly milestones.
- XP: Yes adds XP live while entering; No adds nothing; Not today / Rest days are removed from that day's max XP (and the pass threshold = day max − deduction).
- Monthly milestones written in Settings; completing one lets the owner spend from the other person's piggy bank (₹ deposit × lost days − spent) and note the reward.
- Reports: per-person insights (strongest/weakest habit, XP left on table, best weekday, longest streak, piggy bank).
- Shop cards restyled.

## v7b update
- **Pup:** now your cavapoo photo (assets/pup.png, cut out) inside a 3D scene (petphoto.js); drag to tilt, double-tap to reset. Shop items are real 3D models. Buy, then tap **Add to puppy** / **Take off**.
- **Insights tab:** muscle balance, 6 charts, weekly comparison, forgiving habit streaks, recovery check, monthly consistency calendar.
- **Rewards tab:** piggy banks, milestones, punishments (both-miss days, rotating through your list), rules summary.
- **Settings:** minimum XP to win a day, milestone period (days), period start date, punishment cadence, deposit per lost day, body weight now/goal (shown on cards), muscle-flag days.
- Win/try-again card after each check-in save. Charts use your answers (target/below/above), since exact sleep hours and steps aren't logged.

## v7c update
- Pup photo is embedded in petphoto.js, so it also shows when index.html is opened straight from a folder.
- Piggy banks are calculated per period (calendar month by default; Settings can switch to a custom number of days). Earlier periods are listed per person; a milestone spends from its own period's balance.
- Food choices: each of sugar / maida / junk earns its own XP (Settings: XP per food choice).
- Reports tab removed. Insights show Her and Him side by side in medium-size charts.

## v7d update — Awards Room replaces the Pet House
- The 🐶 Pet House tab is now 🏋️ **Awards Room**. Her and Him each get their own room, XP wallet and shop (`gym.js`).
- Shop tabs: Equipment, Decorations, My avatar (outfits), Accessories (Jewellery for Her), Themes. Buy, then Place / Remove, Wear or Apply.
- The room shows your equipment, wall decor, neon sign, theme colours and a full-body avatar wearing your outfit, jewellery and accessories.
- Free starters: yoga mat, dumbbell set, black outfit, first theme. Earlier puppy purchases are cleared (XP wallet is recalculated, so that XP is back).
- Removed Three.js, `pet3d.js`, `petphoto.js` and the pup image. Edit prices in the `ITEMS`, `TH` and `O` lists at the top of `gym.js`.

## v8 — Awards Room now uses your mockup art
- Room scenes, item thumbnails, outfits and themes are cut from your mockups into `assets/gym/her/` and `assets/gym/him/` (`hero.jpg` = room scene, `o-*` outfits, `t-*` themes). Replace any file with a sharper image of the same name.
- Prices are mockup prices ÷ 4 (editable in `gym.js`).


## v9 updates
- Replaced the Gym Room navigation/page with separate Her/Him collectible Awards Rooms. Awards unlock from lifetime XP milestones and must be collected once; all collected awards remain visible in a single gallery per profile. Collecting an award does not deduct XP.
- Added a global Her/Him profile switch for the dashboard, insights, check-in selection, and Awards Room. Recent Logs has separate Her and Him tabs.
- Improved mobile layouts for navigation, awards, forms, and logs.
- Profile names and settings update the visible UI as they are edited/saved, and local browser tabs listen for storage changes.
- Important: this project still stores data in browser localStorage. This supports the same browser and same-browser tabs, but not reliable syncing across different phones/computers. For true shared updates, connect a shared database (e.g. Supabase) with authenticated access and row-level security.


## Latest updates
- Insights compare Her (pink) and Him (blue) on the same line charts.
- Month view groups the selected month into 7-day buckets; selecting Week 1–5 drills down to daily values in that month.
- Work-related metrics are not included in Insights.
- Unfinished milestones carry forward until achieved and display a current / 1-month-late / 2+-months-overdue status.
- Insights use recorded check-ins only; missing or skipped entries are not fabricated.


## v10 Insights update
- Added separate My Insights and Comparison tabs.
- Personal Insights use daily bar charts, habit progress bars, and a consistency calendar.
- In Week 1–5 view, comparison charts plot each calendar day separately (not one weekly point); missing values leave gaps instead of being connected.
- Whole-month comparison remains weekly aggregated.
- No work-related metrics are included.


## v11 update
- Dashboard profile cards are stacked one after another, with profile portraits and key monthly stats; streak concept removed from cards.
- Personal insight bar charts include a dashed linear trend line. Comparison charts use adjacent pink (Her) and blue (Him) bars plus matching trend lines.
- Comparison insights include a shared calendar with paired per-day indicators for both profiles.
- Mobile charts retain horizontal scrolling where dates need room rather than squeezing all date labels together.
- Backup/export/import code reviewed: JSON full backup restores settings, both profiles' logs, pet inventory and awards; CSV export/import handles check-ins and merges by profile/date. CSV only; .xlsx import is not supported. Browser-local storage means separate phones still do not sync without a shared backend.


### Shared log calendar status symbols (v12)
- Her is represented by a heart (♥); Him is represented by a football (⚽).
- Both symbols are green when that profile meets the day’s XP threshold, red when a saved check-in is below the threshold, and grey when no check-in exists.
- The calendar legend explains the symbols and statuses.
