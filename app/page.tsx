import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-28 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Create Brainrot Videos Instantly
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-black/60 dark:text-white/60 max-w-2xl mx-auto">
            Pick your favorite characters, enter a topic, and get a viral-ready video with AI voice cloning and gaming backgrounds
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/generate"
              className="rounded-full bg-black px-6 py-3 text-base font-medium text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
            >
              Create Video
            </Link>
            <a
              href="#demo"
              className="rounded-full border border-black/20 dark:border-white/20 px-6 py-3 text-base font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Watch Demo
            </a>
          </div>
        </section>

        <section id="demo" className="mx-auto max-w-3xl px-6 pb-16">
          <div className="relative aspect-[9/16] max-h-[600px] w-full max-w-[340px] mx-auto rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 group cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-black/30 dark:text-white/30">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <polygon points="10,8 16,12 10,16" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-0.5 text-xs text-white">
              0:45
            </div>
          </div>
          <p className="mt-3 text-center font-semibold text-lg">how to make eggs</p>
          <p className="mt-1 text-center text-sm text-black/50 dark:text-white/50 max-w-md mx-auto">
            Turn any topic into a hilarious skit with Family Guy, Breaking Bad, SpongeBob, and more
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight mb-12">How It Works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white text-lg font-bold dark:bg-white dark:text-black">
                1
              </div>
              <h3 className="font-semibold text-lg">Pick Characters &amp; Topic</h3>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                Choose from character packs like Family Guy, Breaking Bad, or SpongeBob. Then enter any topic.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white text-lg font-bold dark:bg-white dark:text-black">
                2
              </div>
              <h3 className="font-semibold text-lg">AI Generates the Script</h3>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                AI writes an in-character dialogue, then voice cloning brings each line to life.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white text-lg font-bold dark:bg-white dark:text-black">
                3
              </div>
              <h3 className="font-semibold text-lg">Download Viral Video</h3>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                1080×1920 vertical video with captions, character overlays, and gaming backgrounds.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight mb-12">Character Presets</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-black/10 dark:border-white/15 p-5 text-center">
              <div className="text-3xl mb-2">👨‍👦</div>
              <h3 className="font-semibold">Family Guy</h3>
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">Peter &amp; Stewie</p>
            </div>
            <div className="rounded-2xl border border-black/10 dark:border-white/15 p-5 text-center">
              <div className="text-3xl mb-2">🧪</div>
              <h3 className="font-semibold">Breaking Bad</h3>
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">Walter &amp; Jesse</p>
            </div>
            <div className="rounded-2xl border border-black/10 dark:border-white/15 p-5 text-center">
              <div className="text-3xl mb-2">🌊</div>
              <h3 className="font-semibold">SpongeBob</h3>
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">SpongeBob &amp; Squidward</p>
            </div>
            <div className="rounded-2xl border border-black/10 dark:border-white/15 p-5 text-center">
              <div className="text-3xl mb-2">🏙️</div>
              <h3 className="font-semibold">GTA San Andreas</h3>
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">CJ solo</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ready to Make Magic?</h2>
          <p className="mt-2 text-black/60 dark:text-white/60">
            Create your first viral video in under 5 minutes
          </p>
          <Link
            href="/generate"
            className="mt-6 inline-block rounded-full bg-black px-8 py-3 text-base font-medium text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
          >
            Make It Funny
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
