export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-8 mt-auto">
      <div className="container mx-auto px-4 max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">
          © {new Date().getFullYear()} Adarsh B A. Built with Next.js.
        </p>
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <a href="https://github.com/developeradhi" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
            GitHub
          </a>
          <a href="https://linkedin.com/in/developeradhi" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
