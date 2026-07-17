"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          griffin.video
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/generate"
            className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
          >
            Create Video
          </Link>
        </nav>
      </div>
    </header>
  );
}
