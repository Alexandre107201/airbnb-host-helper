import { Link, useLocation } from "wouter";
import { 
  Home, 
  HomeIcon, 
  KeyRound, 
  LogOut, 
  FileText, 
  MapPin, 
  HelpCircle,
  Eye, 
  Menu,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShareGuestLink } from "@/components/ShareGuestLink";

const NAV_ITEMS = [
  { href: "/", label: "Visão Geral", icon: Home },
  { href: "/property", label: "Meu Apê", icon: HomeIcon },
  { href: "/checkin", label: "Check-in", icon: KeyRound },
  { href: "/checkout", label: "Check-out", icon: LogOut },
  { href: "/rules", label: "Regras", icon: FileText },
  { href: "/tips", label: "Dicas Locais", icon: MapPin },
  { href: "/faq", label: "Perguntas Frequentes", icon: HelpCircle },
  { href: "/guests", label: "Hóspedes", icon: Users },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-card border-r w-64">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-serif text-primary font-bold">Meu Apê</h2>
        <p className="text-sm text-muted-foreground mt-1">Painel do Anfitrião</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="block">
              <Button 
                variant={isActive ? "secondary" : "ghost"} 
                className={`w-full justify-start ${isActive ? 'bg-secondary text-secondary-foreground font-medium' : 'text-muted-foreground'}`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Link href="/guest" className="block">
          <Button variant="outline" className="w-full justify-start text-primary border-primary/20 hover:bg-primary/5">
            <Eye className="mr-3 h-5 w-5" />
            Ver como hóspede
          </Button>
        </Link>
        <ShareGuestLink />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <SidebarContent />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <h2 className="text-xl font-serif text-primary font-bold">Meu Apê</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
