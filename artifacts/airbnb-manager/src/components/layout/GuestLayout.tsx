import { useLocation } from "wouter";

export function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] text-[#2C2420] font-sans antialiased selection:bg-primary/20">
      {/* Decorative header border */}
      <div className="h-2 w-full bg-gradient-to-r from-primary/80 via-primary to-amber-500/80" />
      
      <main className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        {children}
      </main>

      <footer className="max-w-2xl mx-auto px-6 pb-12 text-center text-sm text-muted-foreground">
        <p>Feito com carinho para sua estadia.</p>
      </footer>
    </div>
  );
}
