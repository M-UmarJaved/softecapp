export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-background/60 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p>Copyright {year} Softec Hackathon Fortress.</p>
        <p className="font-heading text-xs uppercase tracking-[0.16em]">
          Built for Softec &apos;26
        </p>
      </div>
    </footer>
  );
}