# BodiMate - Boarding Management System

BodiMate is a web-based boarding management application built to streamline the process of finding and managing student accommodations.

## Features

*   **Robust Authentication**: Role-based access control separating **Students** and **Owners**.
*   **Property Discovery**: Browse, filter, and view detailed listings of boarding properties.
*   **Booking System**: Students can save favorite properties and submit booking requests directly to owners.
*   **Owner Dashboard**: Owners can manage their listings, view metrics (Total Listings, Active Listings, Ratings), and accept/reject student booking requests.
*   **Student Hub**: A dedicated dashboard for students to track their saved places and booking request statuses.
*   **Review System**: Students can leave ratings and reviews for properties they have interacted with.

## Tech Stack

*   **Frontend**: Next.js 14+ (App Router), React, TypeScript
*   **Styling**: Tailwind CSS, shadcn/ui
*   **Backend / Database / Auth**: Supabase
*   **Icons**: Lucide React

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm or yarn
*   A Supabase project (Database and Authentication enabled)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/inusha-thathsara/Bodimate-IN1621.git
    cd Bodimate-IN1621
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Set up environment variables. Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

### Database Setup

You will need to run the following scripts in your Supabase SQL Editor to establish the necessary tables and row-level security (RLS) policies.

**Table Layouts Needed:**
- `users`: (Handled by Supabase Auth, but usually has a public profile counterpart)
- `boardings`: id, title, description, location, price, type, owner_id (ref users), etc.
- `reviews`: id, boarding_id (ref boardings), user_id (ref users), rating, comment
- `requests`: id, boarding_id (ref boardings), student_id (ref users), status ('PENDING', 'ACCEPTED', 'REJECTED')
- `saved_boardings`: id, boarding_id (ref boardings), student_id (ref users)

*(Note: The `requests` and `saved_boardings` tables require specific RLS policies to allow authenticated inserts. Ensure you've enabled RLS allowing `authenticated` roles to insert/update their own rows).*

### Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
