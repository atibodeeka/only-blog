import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">About OnlyBlog</h1>
        <p className="mt-2 text-muted-foreground">
          A little bit about this place and the people behind it.
        </p>
      </div>

      <Separator />

      <div className="space-y-6 leading-relaxed text-foreground/90">
        <p>
          Welcome to <span className="font-semibold">OnlyBlog</span> — a
          minimal, open community blog where anyone can share their thoughts,
          ideas, and stories.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight">Tech Stack</h2>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>
            <span className="text-foreground">Next.js</span> — React framework
            for the frontend and API
          </li>
          <li>
            <span className="text-foreground">Tailwind CSS</span> —
            Utility-first styling
          </li>
          <li>
            <span className="text-foreground">shadcn/ui</span> — Accessible
            component primitives
          </li>
          <li>
            <span className="text-foreground">Drizzle ORM + Neon</span> —
            Type-safe database layer on serverless Postgres
          </li>
          <li>
            <span className="text-foreground">tRPC</span> — End-to-end type-safe
            API calls
          </li>
        </ul>

        <Separator />

        <h2 className="text-2xl font-semibold tracking-tight">
          About the Author
        </h2>
        <p>
          I&apos;m a developer who enjoys building clean, fast websites.
          OnlyBlog is a playground for experimenting with modern web
          technologies while keeping things simple and readable.
        </p>
        <p>
          Feel free to browse around and write a post yourself — this is a
          community blog, after all.
        </p>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          Thanks for stopping by.
        </p>
      </div>
    </div>
  );
}
