# ticktok - Timesheet Management Dashboard

A modern, full-stack Timesheet Management application built with Next.js 16, Prisma, and NextAuth. This project focuses on a clean UI/UX, robust data management, and efficient timesheet tracking.

---

##  Setup Instructions

### 1. Prerequisites
- Node.js 20+
- PostgreSQL Database

### 2. Installation
1. **Clone and Install:**
   ```bash
   git clone <repository-url>
   cd tentwenty
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the root:
   ```env
   DATABASE_URL="your-database-url"
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Database Setup:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Run Application:**
   ```bash
   npm run dev
   ```

---

##  User Credentials (Demo)
- **Email**: `admin@tentwenty.com`
- **Password**: `password123`

---

##  Frameworks & Libraries

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS & Shadcn UI
- **Testing**: Vitest & React Testing Library
- **Notifications**: Goey-Toast

---

##  Key Assumptions & Notes

- **Working Hours**: Standard work week is assumed to be 40 hours.
- **Weekly Cycle**: Timesheets are calculated from Sunday to Saturday.
- **Color System**: All colors are managed via global CSS variables in `globals.css` for easy theme management.
- **Performance**: Pagination, sorting, and date-range filtering are implemented server-side for optimal performance.

---

##  Testing

Run the test suite with:
```bash
npm test
```

---

##  Time Spent
- **Total Development Time**: ~5.5 Hours
