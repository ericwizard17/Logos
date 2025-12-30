# Logos

A premium intellectual discussion platform for book lovers and scholars.

## Features

- 🔐 **Google OAuth Authentication**
- 📚 **Personal Library Management**
- 💬 **Real-time Discussions** with spoiler protection
- 🤖 **AI-Powered Summaries** (OpenAI integration)
- ✅ **Book Completion Tracking**
- 🌍 **Multilingual Support** (Turkish, English, Greek, Latin)
- 🎨 **Premium UI** with glassmorphism and smooth animations

## Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack)
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: OpenAI GPT-4
- **Styling**: CSS Modules with glassmorphism
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Google Cloud Console project (for OAuth)
- OpenAI API key (optional, for AI summaries)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd Logos

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

### Database Setup

1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase_schema.sql`
3. Verify tables are created

### Populate Books (Optional)

```bash
npm run populate-books
```

This will fetch 15,000 books from Open Library API.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

See [deployment_plan.md](./deployment_plan.md) for detailed instructions.

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes
│   ├── invite/       # Authentication page
│   ├── library/      # Main library & discussions
│   └── profile/      # User profile
├── components/       # Reusable components
├── context/          # React contexts (Auth, Language)
└── lib/              # Utilities (Supabase, AI, etc.)
```

## Features in Detail

### Authentication
- Google OAuth integration
- Session persistence
- Protected routes via middleware

### Library Management
- Search books via Open Library API
- Track reading progress
- Mark books as completed

### Discussions
- Real-time comments with Supabase
- Spoiler protection (only show comments up to user's page)
- Chapter-based view

### AI Summaries
- Full book overview
- Progress-based summary (up to current page)
- Powered by OpenAI GPT-4

## Contributing

Contributions welcome! Please read our contributing guidelines first.

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please open a GitHub issue.
