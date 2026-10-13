# Wedding Invitation + Integrated RSVP

A responsive bilingual (English / Myanmar) wedding invitation website with an embedded RSVP form.

- Customize names, date, hall, map and Supabase connection in `config.js`.
- Invite guests with a GitHub Pages public URL.
- Guests submit name, attendance, party size and optional message from **this page** without login.
- Responses are stored privately in your own Supabase table. Open **Table Editor** to review them.

**Setup required:** Read `RSVP_SETUP_JA.md`, run `supabase-setup.sql` in your Supabase project, and add its Project URL + publishable key to `config.js` before sharing. Submitting is disabled until configured. Never use a secret/service_role key in front-end code.

Upload the website files in the repository root and enable GitHub Pages (Settings > Pages > main / root). Use HTTPS on the published URL.


## Photo background version
This version includes your four uploaded photos as background images in order:
1. Hero section
2. Story section
3. Details / Save the Date section
4. RSVP section

The `countdown` and `order of celebration` sections intentionally do not use photo backgrounds.


## Countdown placement
Countdown is now inside the hero photo, between the Burmese introduction and VIEW INVITATION. The separate countdown section was removed, and the wedding date remains visible underneath the timer.
