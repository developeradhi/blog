export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
          Thoughts &amp; Engineering
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
          Deep dives into Full-Stack Development, System Architecture, and building scalable applications.
        </p>
        
        <div className="pt-10">
          <p className="text-sm text-neutral-500 font-mono">More coming soon...</p>
        </div>
      </div>
    </main>
  );
}
