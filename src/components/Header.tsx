import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
        <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="text-emerald-500">_</span>blog
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-neutral-400">
          <Link href="/" className="hover:text-emerald-400 transition-colors">
            Articles
          </Link>
          <a href="https://adhi.is-a.dev" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
            Portfolio
          </a>
        </nav>
      </div>
    </header>
  );
}
