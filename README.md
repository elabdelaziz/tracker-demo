# Memtime Tracker

A secure serverless application built with **Next.js 15**, leveraging Server Actions for maximum security. All API requests are handled server-to-server, ensuring that sensitive API secrets are never exposed to the client.

## Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Features

- **Maximum Security**: Server-to-server request pattern via Server Actions. API keys remain strictly server-side, preventing exposure in browser network logs.
- **Clients Tree View**: A hierarchical, navigable view of all clients.
  - Drill down from **Clients** → **Projects** → **Tasks**.
  - Intelligent caching of already opened tree items for a snappy user experience.
- **Time Entry Management**: Full-featured table view for time entries.
  - Create, Edit, and Delete entries with ease.
  - Beautifully integrated Date and Time pickers for precise tracking.
- **Advanced Rate Limiting**: Intelligent protection against API abuse.
  - **Global Cooldown**: Persistent counter that shows a useful message to the user when limited.
  - **Live Feedback**: Real-time countdown in the UI during cooldown periods.
- **Optimized Layers**:
  - **Pagination Cache**: Prevents spamming pagination limits, reducing unnecessary API load.
  - **Client-Side Tree Cache**: Instant reopening of previously loaded projects and tasks.
  - **Native Next.js Fetch Cache**: Revalidation patterns to keep data fresh yet performant.

## Specifications

1.  **Tree View**: Complete hierarchical navigation for all Client → Project → Task relationships.
2.  **Time Management**: Comprehensive CRUD operations for work entries within a responsive, modern table.

## Getting Started

### Environment Variables

Create a `.env` file in the root directory and add your Memtime API credentials:

```env
MEMTIME_API_URL=your_api_url
MEMTIME_API_KEY=your_api_key
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
