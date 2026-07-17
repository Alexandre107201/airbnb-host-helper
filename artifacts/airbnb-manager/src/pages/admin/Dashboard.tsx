import { Link } from "wouter";
import { 
  useGetProperty, 
  useListCheckinSteps, 
  useListCheckoutSteps, 
  useListRules, 
  useListLocalTips,
  useListCheckoutNotifications,
  useDismissCheckoutNotification,
  getListCheckoutNotificationsQueryKey,
} from "@workspace/api-client-react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HomeIcon, KeyRound, LogOut, FileText, MapPin, ArrowRight, BellRing, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareGuestLink } from "../../components/ShareGuestLink";
import { useQueryClient } from "@tanstack/react-query";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.535 5.877L.057 23.5a.5.5 0 0 0 .613.613l5.701-1.476A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.537-5.197-1.467l-.374-.22-3.875 1.003 1.022-3.793-.242-.389A9.958 9.958 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function CheckoutNotificationBanner({ contactPhone }: { contactPhone?: string | null }) {
  const { data: notifications } = useListCheckoutNotifications({
    query: { refetchInterval: 30_000, queryKey: getListCheckoutNotificationsQueryKey() },
  });
  const dismiss = useDismissCheckoutNotification();
  const queryClient = useQueryClient();

  if (!notifications || notifications.length === 0) return null;

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return `hoje às ${formatTime(dateStr)}`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + ` às ${formatTime(dateStr)}`;
  }

  function buildWhatsAppUrl(dateStr: string) {
    const msg = `🏠 *Apartamento entregue!*\nUm hóspede concluiu o check-out ${formatDate(dateStr)}. Verifique o imóvel quando possível.`;
    const phone = (contactPhone || "").replace(/\D/g, "");
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  function handleDismiss(id: number) {
    dismiss.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCheckoutNotificationsQueryKey() }),
    });
  }

  return (
    <div className="space-y-2 mb-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-sm"
          data-testid={`checkout-notification-${n.id}`}
        >
          <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <BellRing className="h-4 w-4 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-green-800 text-sm">🏠 Apartamento entregue!</p>
            <p className="text-xs text-green-600 mt-0.5">
              Um hóspede concluiu o check-out {formatDate(n.createdAt)}.
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {contactPhone && (
              <a
                href={buildWhatsAppUrl(n.createdAt)}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full flex items-center justify-center bg-[#25D366] hover:bg-[#20b85a] transition-colors text-white"
                title="Enviar via WhatsApp"
                data-testid={`whatsapp-notification-${n.id}`}
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={() => handleDismiss(n.id)}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors text-green-600"
              title="Dispensar"
              data-testid={`dismiss-notification-${n.id}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: property, isLoading: loadingProp } = useGetProperty();
  const { data: checkin, isLoading: loadingIn } = useListCheckinSteps();
  const { data: checkout, isLoading: loadingOut } = useListCheckoutSteps();
  const { data: rules, isLoading: loadingRules } = useListRules();
  const { data: tips, isLoading: loadingTips } = useListLocalTips();

  const isLoading = loadingProp || loadingIn || loadingOut || loadingRules || loadingTips;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { title: "Check-in", count: checkin?.length || 0, icon: KeyRound, href: "/checkin", desc: "Passos de entrada" },
    { title: "Check-out", count: checkout?.length || 0, icon: LogOut, href: "/checkout", desc: "Passos de saída" },
    { title: "Regras", count: rules?.length || 0, icon: FileText, href: "/rules", desc: "Regras da casa" },
    { title: "Dicas", count: tips?.length || 0, icon: MapPin, href: "/tips", desc: "Dicas locais" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <CheckoutNotificationBanner contactPhone={property?.contactPhone} />

        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Olá, Anfitrião! 👋</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Aqui está o resumo do seu espaço <span className="font-semibold text-primary">{property?.name || "Meu Apê"}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statCards.map((stat, i) => (
            <Card key={i} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-3xl font-bold">{stat.count}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                  </div>
                  <Link href={stat.href} className="block">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Gerenciar <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-primary/5 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5 text-primary" />
              Informações do Imóvel
            </CardTitle>
            <CardDescription>Mantenha os dados do seu espaço atualizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="space-y-1">
                <p className="text-sm"><span className="font-medium">Endereço:</span> {property?.address || "Não informado"}</p>
                <p className="text-sm"><span className="font-medium">Wi-Fi:</span> {property?.wifiName || "Não informado"}</p>
              </div>
              <Link href="/property" className="block">
                <Button variant="outline">Editar Imóvel</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              Compartilhar com Hóspedes
            </CardTitle>
            <CardDescription>
              Envie o link ou QR Code para seus hóspedes antes da chegada. Eles verão todas as instruções em uma página bonita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShareGuestLink />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
