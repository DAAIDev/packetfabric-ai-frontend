# PacketFabric.ai Frontend

AI-powered assistant for PacketFabric network services built with Next.js 14.

## Features

- ✨ Modern Next.js 14 App Router architecture
- 🎨 Beautiful UI with Framer Motion animations
- 🌐 Three.js particle background
- 💬 Real-time chat interface
- 🐳 Docker support for easy deployment
- 🚀 Optimized for GCP Cloud Run

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Graphics**: Three.js
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:
- `PFAPI_URL` - URL to your pfapi backend (default: http://localhost:8080)

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Building for Production

```bash
npm run build
npm start
```

## Docker Deployment

### Build and run with Docker:

```bash
docker build -t packetfabric-ai-frontend .
docker run -p 3000:3000 -e PFAPI_URL=http://pfapi:8080 packetfabric-ai-frontend
```

### Using Docker Compose:

```bash
docker-compose up
```

This will start both the frontend and pfapi backend services.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page (hero + chat)
│   ├── globals.css        # Global styles
│   └── api/
│       └── query/
│           └── route.ts   # API endpoint for chat queries
├── components/
│   ├── landing/           # Landing page components
│   │   ├── HeroSection.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── ThreeJSBackground.tsx
│   │   ├── QuoteDisplay.tsx
│   │   ├── PricingTable.tsx
│   │   └── QuickActions.tsx
│   └── ui/                # shadcn/ui components
├── lib/
│   └── utils.ts           # Utility functions
├── public/                # Static assets
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## API Integration

The frontend communicates with the pfapi backend through the `/api/query` endpoint. All chat messages are proxied through this Next.js API route to keep the backend secure.

### API Request Format:

```typescript
POST /api/query
{
  "query": "How much does a 10Gbps connection cost?"
}
```

### API Response Format:

```typescript
{
  "answer": "Based on current pricing...",
  "sources": [...],
  "includes_live_pricing": true
}
```

## Environment Variables

- `PFAPI_URL` - Backend API URL (default: http://pfapi:8080)
- `NODE_ENV` - Environment (development/production)

## Authentication

Authentication is currently disabled for development. After meeting with Vlad, we'll implement proper authentication in the API route.

## Deployment to GCP Cloud Run

The app is configured for deployment to Google Cloud Run with the `standalone` output mode in `next.config.js`.

### Deploy steps:

1. Build the Docker image
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Set environment variables in Cloud Run console

## Development Notes

- **Placeholder components**: Some landing components (HeroSection, ChatInterface, ThreeJSBackground) are placeholders awaiting your component code
- **No authentication yet**: Will be added after meeting
- **Three.js**: Background animation ready for implementation
- **Framer Motion**: All animations preserved from Base44

## Component Customization

Replace placeholder components in `components/landing/` with your actual component code. Each component is structured to match the Base44 prototype.

## Contributing

This project is part of PacketFabric.ai internal development.

## License

Proprietary - PacketFabric
