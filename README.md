# CoursEces Project

This is a React application using Vite and Supabase for authentication and course management.

## Structure

- `src/`
  - `components/` - shared UI components (Navbar, Link, etc.)
  - `contexts/` - React context (AuthContext for authentication state)
  - `lib/` - Supabase client initialization
  - `pages/` - application pages (Home, Admin, Courses, TeacherDashboard, TeacherLogin)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure Supabase**
   - Create a project on [Supabase](https://supabase.com)
   - Add credentials to `.env` file (e.g. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
   - Use `supabase-setup.sql` to initialize database tables and roles.

3. **Run development server**
   ```bash
   npm run dev
   ```

## Usage

- Visitors can view the home page and course listings.
- Teachers can log in via the teacher login page.
- Once authenticated, teachers access the Teacher Dashboard to manage courses.
- The Admin page is for administrative features (requires appropriate permissions).

## Build

To build for production:
```bash
npm run build
```

## Notes

- Tailwind CSS is configured via `tailwind.config.js` and `postcss.config.js`.
- ESLint is set up via `eslint.config.js`.
- Typescript configurations exist in `tsconfig*.json` files.

For additional information, refer to the project documentation or contact the maintainer.