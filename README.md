# BodiMate

BodiMate is a university boarding management platform that connects students looking for accommodation with owners listing boarding properties, and includes an admin control surface for platform analytics.

The application is built with Next.js App Router and Supabase, and currently supports role-based dashboards, admin analytics, property discovery, booking requests, reviews, saved listings, realtime notifications, password recovery, QR sharing, and a multi-image property gallery.

## Current Features

- Role-based authentication for `STUDENT`, `OWNER`, and `ADMIN` users.
- Public boarding discovery with filters for location, distance, price, gender preference, and amenities.
- Detailed boarding pages with multi-image gallery, fullscreen image viewer, reviews, rules, and facilities.
- Listing share modal with QR code generation and PNG download.
- Student hub for saved listings and booking request tracking.
- Owner dashboard for listing management, request handling, and review monitoring.
- Admin dashboard with analytics cards and recent platform activity views.
- Realtime notifications for:
    - new booking requests
    - new reviews
    - saved listings
    - request accepted / rejected updates
- Auth recovery flow with forgot-password and reset-password pages.
- Theme switcher (light/dark) with persisted preference.
- Built-in legal pages for Privacy Policy and Terms of Service.
- Property creation with required 5-image upload flow.

## Tech Stack

- Next.js 16.1.6
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui + Radix UI primitives
- Zustand for client-side user state
- Supabase Auth, Database, Storage, and Realtime
- Lucide React icons

## Project Structure

Important application areas:

- `src/app`: App Router pages and layouts
- `src/components`: UI, layout, dashboard, and feature components
- `src/lib/api.ts`: Client-side data access layer for Supabase
- `src/lib/supabase`: browser/server/middleware Supabase clients
- `src/store/useUserStore.ts`: authenticated user store
- `src/types/database.types.ts`: typed database schema used by the app

## Main User Flows

### Students

- Register and log in
- Browse and filter boardings
- View property image gallery and fullscreen images
- Save favorite listings
- Send booking requests
- Track request status changes
- Submit reviews

### Owners

- Register and log in
- Create listings with exactly 5 property images
- Edit and delete listings
- Review incoming booking requests
- Accept or reject requests
- Monitor reviews and notifications

### Admins

- Access admin-only dashboard at `/admin/dashboard`
- Review platform metrics: users, listings, requests, and reviews
- Inspect recent requests and recently joined users
- Use dashboard top bar actions: notifications, theme switch, and sign out

## Requirements

- Node.js 18 or newer
- npm
- A Supabase project with:
    - Authentication enabled
    - Database tables created
    - Storage enabled
    - Realtime enabled for notifications if you want live bell updates

## Installation

```bash
npm install
```

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Running The App

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

Linting:

```bash
npm run lint
```

## Database Model Used By The App

The current application code expects these main tables in the `public` schema:

- `users`
    - `id`
    - `role` (`STUDENT` | `OWNER` | `ADMIN`)
    - `full_name`
    - `email`
    - `phone_number`
    - `gender`
    - `university`
    - `age`
    - `created_at`

- `boardings`
    - `id`
    - `owner_id`
    - `title`
    - `description`
    - `price`
    - `address`
    - `is_available`
    - `number_of_beds`
    - `rent_includes_bills`
    - `google_maps_url`
    - `distance_university`
    - `distance_supermarket`
    - `distance_town`
    - `rules`
    - `preferred_gender`
    - `image_url`
    - `image_urls`
    - amenity flags such as `has_wifi`, `has_ac`, `attached_bathroom`, `has_kitchen`, `has_balcony`, `has_laundry`
    - `created_at`

- `reviews`
    - `id`
    - `boarding_id`
    - `student_id`
    - `rating`
    - `comment`
    - `created_at`

- `requests`
    - `id`
    - `boarding_id`
    - `student_id`
    - `status` (`PENDING` | `ACCEPTED` | `REJECTED`)
    - `created_at`

- `saved_boardings`
    - `id`
    - `boarding_id`
    - `student_id`
    - `created_at`

- `notifications`
    - `id`
    - `recipient_id`
    - `actor_id`
    - `boarding_id`
    - `type`
    - `title`
    - `message`
    - `is_read`
    - `created_at`

## Supabase SQL Scripts In This Repository

The repository currently includes these SQL helpers:

- `supabase_add_gender_boarding.sql`
    - adds `preferred_gender` support to `boardings`

- `supabase_storage_bucket.sql`
    - creates the `boarding_images` storage bucket
    - configures storage access policies

- `supabase_notifications.sql`
    - creates the `notifications` table
    - adds indexes and RLS policies

Note:

- This repository does not currently include one complete SQL bootstrap file for all base tables.
- Your Supabase project must already contain the core `users`, `boardings`, `reviews`, `requests`, and `saved_boardings` tables expected by `src/types/database.types.ts`.

## Storage Setup

Property images are uploaded to the Supabase storage bucket `boarding_images`.

Run:

```sql
-- in Supabase SQL Editor
-- use the contents of supabase_storage_bucket.sql
```

## Notification Setup

For bell notifications to work correctly:

1. Run `supabase_notifications.sql` in your Supabase SQL Editor.
2. Ensure Realtime is enabled for the `notifications` table in Supabase.
3. Confirm your authenticated users can `select`, `insert`, and `update` notifications through the provided RLS policies.

## Current Routes

- `/` home page
- `/boardings` public boarding feed
- `/boardings/[id]` boarding details
- `/login` login page
- `/register` registration page
- `/forgot-password` password reset request page
- `/reset-password` password reset completion page
- `/dashboard` owner dashboard
- `/dashboard/boardings/new` create listing
- `/dashboard/boardings/[id]/edit` edit listing
- `/student/dashboard` student dashboard
- `/admin/dashboard` admin analytics dashboard
- `/profile` user profile settings
- `/privacy-policy` legal privacy policy page
- `/terms-of-service` legal terms page

## Role Access Rules

- `OWNER` users are routed to `/dashboard` after authentication.
- `STUDENT` users are routed to `/student/dashboard` after authentication.
- `ADMIN` users are routed to `/admin/dashboard` after authentication.
- Middleware enforces admin isolation:
    - admins are redirected away from student/owner/public app surfaces to `/admin/dashboard`
    - non-admin users are redirected away from `/admin/*`

## Known Notes

- Listing creation currently requires exactly 5 images.
- Existing legacy listings created before that validation may still contain fewer images.
- If you change remote image host configuration in `next.config.ts`, restart the dev server.
- Admin accounts are not created through the public registration form.

## Manual Setup Required For Admin Role

If your project originally supported only `STUDENT` and `OWNER`, run the following in Supabase SQL Editor.

If `users.role` is enforced by a check constraint:

```sql
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
ADD CONSTRAINT users_role_check
CHECK (role IN ('STUDENT', 'OWNER', 'ADMIN'));
```

If `users.role` uses a PostgreSQL enum type:

```sql
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ADMIN';
```

Promote at least one existing account:

```sql
UPDATE public.users
SET role = 'ADMIN'
WHERE email = 'your-admin-email@example.com';
```

## Documentation

Full project documentation (design decisions, planning, and coursework notes) is available on Notion:

[IN1621 Web Technologies – BodiMate Documentation](https://www.notion.so/IN1621-Web-Technologies-809fa20da46d832ca35581d892dc0a8b)


GitHub Link: https://github.com/inusha-thathsara/Bodimate-IN1621

## Support Contact

- Email: `inusha.thathsara@gmail.com`

## License

This repository includes a `LICENSE` file at the project root.
