# LinkedIn But Cooler

A visual, creative-first professional network for artists, designers, photographers, and other creatives.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Auth.js (NextAuth) v5

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials (for Google sign-in)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/linkedin_but_cooler?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

   Generate `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

3. **Set up the database:**
   ```bash
   npm run db:generate  # Generate Prisma Client
   npm run db:push      # Push schema to database (or use db:migrate for migrations)
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/
│   ├── (auth)/          # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/          # Main app routes
│   │   ├── feed/
│   │   ├── profile/
│   │   ├── jobs/
│   │   ├── events/
│   │   └── messages/
│   ├── api/             # API routes
│   │   └── auth/
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Homepage
├── components/
│   ├── ui/              # shadcn/ui components
│   └── features/        # Feature-specific components
├── lib/
│   ├── prisma/          # Prisma client
│   ├── auth.ts          # Auth.js configuration
│   ├── utils.ts         # Utility functions
│   └── validations/     # Zod schemas
├── prisma/
│   └── schema.prisma    # Database schema
└── types/               # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio

## Next Steps

1. Set up shadcn/ui components as needed:
   ```bash
   npx shadcn-ui@latest add [component-name]
   ```

2. Implement the Profile feature (create/edit profile, portfolio grid)

3. Add image upload functionality (Cloudinary integration)

## License

MIT



