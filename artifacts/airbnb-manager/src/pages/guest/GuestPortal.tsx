import { useState } from "react";
import { useGetGuestPortal, useCreateCheckoutNotification } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Home,
  KeyRound,
  LogOut,
  Wifi,
  FileText,
  MapPin,
  Phone,
  AlertTriangle,
  ChevronLeft,
  Copy,
  Check,
  Utensils,
  Coffee,
  Bus,
  ShoppingBag,
  Star,
  Clock,
  Users,
  Mail,
  ExternalLink,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

type Section =
  | "home"
  | "welcome"
  | "checkin"
  | "checkout"
  | "wifi"
  | "rules"
  | "tips"
  | "emergency"
  | "contact"
  | "faq";

type LocalTip = {
  id: number;
  title: string;
  description: string;
  category: string;
  address?: string | null;
};

const SECTION_ICONS: Record<string, { icon: typeof Home; color: string; bg: string }> = {
  welcome: { icon: Home, color: "#fff", bg: "#c2410c" },
  checkin: { icon: KeyRound, color: "#fff", bg: "#b45309" },
  checkout: { icon: LogOut, color: "#fff", bg: "#7c3aed" },
  wifi: { icon: Wifi, color: "#fff", bg: "#0369a1" },
  rules: { icon: FileText, color: "#fff", bg: "#b91c1c" },
  tips: { icon: Utensils, color: "#fff", bg: "#15803d" },
  emergency: { icon: AlertTriangle, color: "#fff", bg: "#dc2626" },
  contact: { icon: Phone, color: "#fff", bg: "#0f766e" },
  faq: { icon: HelpCircle, color: "#fff", bg: "#7c3aed" },
};

const HOME_SECTIONS = [
  { id: "welcome" as Section, label: "Bem-vindo", icon: Home, bg: "#c2410c" },
  { id: "checkin" as Section, label: "Check-in", icon: KeyRound, bg: "#b45309" },
  { id: "wifi" as Section, label: "Wi-Fi", icon: Wifi, bg: "#0369a1" },
  { id: "rules" as Section, label: "Regras", icon: FileText, bg: "#b91c1c" },
  { id: "tips" as Section, label: "Dicas Locais", icon: MapPin, bg: "#15803d" },
  { id: "emergency" as Section, label: "Emergências", icon: AlertTriangle, bg: "#dc2626" },
  { id: "checkout" as Section, label: "Check-out", icon: LogOut, bg: "#6d28d9" },
  { id: "contact" as Section, label: "Contato", icon: Phone, bg: "#0f766e" },
  { id: "faq" as Section, label: "Dúvidas", icon: HelpCircle, bg: "#7c3aed" },
];

function SectionHeader({
  title,
  sectionId,
  onBack,
}: {
  title: string;
  sectionId: Section;
  onBack: () => void;
}) {
  const meta = SECTION_ICONS[sectionId];
  const Icon = meta?.icon ?? Home;
  return (
    <div
      className="flex items-center gap-3 px-5 py-4 sticky top-0 z-10"
      style={{ backgroundColor: meta?.bg ?? "#c2410c" }}
    >
      <button
        onClick={onBack}
        className="rounded-full p-1.5 hover:bg-white/20 transition-colors"
        data-testid="button-back"
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>
      <Icon className="h-5 w-5 text-white" />
      <h2 className="text-lg font-bold text-white tracking-wide uppercase">{title}</h2>
    </div>
  );
}

function WelcomeSection({
  property,
  onBack,
}: {
  property: { name: string; address: string; description: string; checkInTime: string; checkOutTime: string; maxGuests: number; wifiName: string; wifiPassword: string };
  onBack: () => void;
}) {
  const [copied, setCopied] = useState<"name" | "password" | null>(null);

  function copyToClipboard(text: string, field: "name" | "password") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SectionHeader title="Bem-vindo" sectionId="welcome" onBack={onBack} />
      <div className="p-5 space-y-5">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
          <h1 className="text-2xl font-bold text-orange-900 mb-1">{property.name}</h1>
          <p className="text-sm text-orange-700 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {property.address || "Endereço não informado"}
          </p>
        </div>

        {property.description && (
          <p className="text-gray-600 leading-relaxed text-sm">{property.description}</p>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border rounded-2xl p-4 text-center shadow-sm">
            <Clock className="h-5 w-5 mx-auto mb-1.5 text-orange-600" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Check-in</p>
            <p className="font-bold text-gray-800">{property.checkInTime}</p>
          </div>
          <div className="bg-white border rounded-2xl p-4 text-center shadow-sm">
            <Clock className="h-5 w-5 mx-auto mb-1.5 text-purple-600" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Check-out</p>
            <p className="font-bold text-gray-800">{property.checkOutTime}</p>
          </div>
          <div className="bg-white border rounded-2xl p-4 text-center shadow-sm">
            <Users className="h-5 w-5 mx-auto mb-1.5 text-teal-600" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Hóspedes</p>
            <p className="font-bold text-gray-800">Máx. {property.maxGuests}</p>
          </div>
        </div>

        {(property.wifiName || property.wifiPassword) && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 px-1">Wi-Fi — toque para copiar</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => copyToClipboard(property.wifiName, "name")}
                className="bg-white border rounded-2xl p-4 text-left shadow-sm active:bg-blue-50 transition-colors"
                data-testid="welcome-wifi-name-copy"
              >
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Rede</p>
                <p className="font-mono font-semibold text-gray-800 text-sm truncate">{property.wifiName}</p>
                <div className="flex justify-end mt-1">
                  {copied === "name"
                    ? <Check className="h-3.5 w-3.5 text-green-500" />
                    : <Copy className="h-3.5 w-3.5 text-gray-300" />}
                </div>
              </button>
              <button
                onClick={() => copyToClipboard(property.wifiPassword, "password")}
                className="bg-white border rounded-2xl p-4 text-left shadow-sm active:bg-blue-50 transition-colors"
                data-testid="welcome-wifi-password-copy"
              >
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Senha</p>
                <p className="font-mono font-semibold text-gray-800 text-sm truncate">{property.wifiPassword}</p>
                <div className="flex justify-end mt-1">
                  {copied === "password"
                    ? <Check className="h-3.5 w-3.5 text-green-500" />
                    : <Copy className="h-3.5 w-3.5 text-gray-300" />}
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckinSection({
  steps,
  onBack,
}: {
  steps: { id: number; order: number; title: string; description: string; icon?: string | null; requiresConfirmation?: boolean | null }[];
  onBack: () => void;
}) {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const required = sorted.filter((s) => s.requiresConfirmation);
  const [confirmed, setConfirmed] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);

  const allConfirmed = required.length === 0 || confirmed.size === required.length;

  function toggleConfirm(id: number) {
    setConfirmed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setReady(false);
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SectionHeader title="Check-in" sectionId="checkin" onBack={onBack} />
      <div className="p-5 space-y-4">
        {sorted.length === 0 && (
          <p className="text-center text-gray-400 py-12">Nenhuma instrução de check-in cadastrada.</p>
        )}
        {sorted.map((step, idx) => {
          const needsConfirm = !!step.requiresConfirmation;
          const isDone = confirmed.has(step.id);
          return (
            <div
              key={step.id}
              className={`flex gap-4 rounded-2xl p-4 shadow-sm border transition-colors ${
                needsConfirm && isDone
                  ? "bg-amber-50 border-amber-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col items-center shrink-0">
                <span className="flex items-center justify-center bg-amber-600 text-white text-sm font-bold h-8 w-8 rounded-full">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {idx < sorted.length - 1 && <div className="w-px flex-1 bg-amber-100 mt-2 min-h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 mb-1">
                  {step.icon && <span className="mr-1">{step.icon}</span>}
                  {step.title}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                {needsConfirm && (
                  <button
                    onClick={() => toggleConfirm(step.id)}
                    className={`mt-3 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      isDone
                        ? "bg-amber-600 border-amber-600 text-white"
                        : "bg-white border-amber-400 text-amber-700"
                    }`}
                    data-testid={`confirm-step-${step.id}`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isDone ? "border-white" : "border-amber-400"}`}>
                      {isDone && <Check className="h-2.5 w-2.5 text-white" />}
                    </div>
                    {isDone ? "Feito ✓" : "Marcar como feito"}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {required.length > 0 && (
          <div className="pt-2">
            {ready ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <p className="text-2xl mb-1">🎉</p>
                <p className="font-bold text-green-800 text-base">Check-in concluído!</p>
                <p className="text-green-600 text-sm mt-1">Aproveite sua estadia!</p>
              </div>
            ) : (
              <button
                onClick={() => { if (allConfirmed) setReady(true); }}
                disabled={!allConfirmed}
                data-testid="btn-checkin-ready"
                className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
                  allConfirmed
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-200 active:scale-95"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {allConfirmed
                  ? "✅ Estou pronto! Check-in feito!"
                  : `Confirme os itens obrigatórios (${confirmed.size}/${required.length})`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutSection({
  steps,
  checkOutTime,
  checkoutNotes,
  reviewUrl,
  onNotifyCheckout,
  onBack,
}: {
  steps: { id: number; order: number; title: string; description: string; icon?: string | null; requiresConfirmation?: boolean | null }[];
  checkOutTime: string;
  checkoutNotes?: string | null;
  reviewUrl?: string | null;
  onNotifyCheckout: () => void;
  onBack: () => void;
}) {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const required = sorted.filter((s) => s.requiresConfirmation);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [delivered, setDelivered] = useState(false);

  function toggleCheck(id: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setDelivered(false);
  }

  const allRequiredDone = required.length === 0 || required.every((s) => checked.has(s.id));

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SectionHeader title="Check-out" sectionId="checkout" onBack={onBack} />
      <div className="p-5 space-y-4">
        <div className="bg-purple-600 rounded-2xl p-5 text-center text-white">
          <p className="text-sm uppercase tracking-widest opacity-80 mb-1">Horário de saída</p>
          <p className="text-5xl font-bold">{checkOutTime}</p>
          <p className="text-xs opacity-70 mt-2">Caso precise de mais tempo, entre em contato</p>
        </div>

        {checkoutNotes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
              📋 Recado do anfitrião
            </p>
            <p className="text-sm text-amber-900 leading-relaxed">{checkoutNotes}</p>
          </div>
        )}

        {sorted.length > 0 && (
          <>
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide px-1">Antes de sair:</h3>
            <div className="space-y-3">
              {sorted.map((step) => {
                const done = checked.has(step.id);
                const isRequired = !!step.requiresConfirmation;
                return (
                  <button
                    key={step.id}
                    onClick={() => toggleCheck(step.id)}
                    data-testid={`checkout-step-${step.id}`}
                    className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                      done
                        ? "bg-purple-50 border-purple-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div
                      className={`shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                        done
                          ? "bg-purple-600 border-purple-600"
                          : isRequired
                          ? "border-purple-400"
                          : "border-gray-300"
                      }`}
                    >
                      {done && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${done ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {step.icon && <span className="mr-1">{step.icon}</span>}
                        {step.title}
                        {isRequired && !done && (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-purple-600 bg-purple-100 rounded-full px-1.5 py-0.5 align-middle">obrigatório</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{step.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 space-y-3">
              {delivered ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                    <p className="text-2xl mb-1">🏠</p>
                    <p className="font-bold text-green-800 text-base">Apartamento entregue!</p>
                    <p className="text-green-600 text-sm mt-1">Obrigado pela visita. Boa viagem!</p>
                  </div>

                  {reviewUrl && (
                    <a
                      href={reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="link-review-checkout"
                      className="flex items-center gap-4 bg-amber-400 active:bg-amber-500 transition-colors rounded-2xl p-5 shadow-md"
                    >
                      <div className="h-12 w-12 bg-white/30 rounded-xl flex items-center justify-center shrink-0">
                        <Star className="h-7 w-7 text-amber-900" fill="#92400e" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-amber-900 text-base leading-tight">Gostou da estadia?</p>
                        <p className="text-amber-800 text-sm mt-0.5">Deixe uma avaliação no Airbnb ⭐</p>
                        <p className="text-amber-700 text-xs mt-1 opacity-80">Leva menos de 1 minuto e faz toda a diferença!</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-amber-800 shrink-0" />
                    </a>
                  )}
                </>
              ) : (
                <button
                  onClick={() => { if (allRequiredDone) { setDelivered(true); onNotifyCheckout(); } }}
                  disabled={!allRequiredDone}
                  data-testid="btn-checkout-done"
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
                    allRequiredDone
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-200 active:scale-95"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {allRequiredDone
                    ? "🏠 Apartamento entregue!"
                    : `Confirme os itens obrigatórios (${required.filter((s) => checked.has(s.id)).length}/${required.length})`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function WifiSection({
  wifiName,
  wifiPassword,
  onBack,
}: {
  wifiName: string;
  wifiPassword: string;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState<"name" | "password" | null>(null);

  function copyToClipboard(text: string, field: "name" | "password") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SectionHeader title="Wi-Fi" sectionId="wifi" onBack={onBack} />
      <div className="p-5 space-y-4">
        <div className="bg-blue-600 rounded-2xl p-6 text-center text-white">
          <Wifi className="h-12 w-12 mx-auto mb-3 opacity-90" />
          <p className="text-sm uppercase tracking-widest opacity-80">Conecte-se agora</p>
        </div>

        <div
          className="bg-white border rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer active:bg-gray-50"
          onClick={() => copyToClipboard(wifiName, "name")}
          data-testid="wifi-name-copy"
        >
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Rede</p>
            <p className="font-mono font-semibold text-gray-800 text-lg">{wifiName || "—"}</p>
          </div>
          {copied === "name" ? (
            <Check className="h-5 w-5 text-green-500 shrink-0" />
          ) : (
            <Copy className="h-5 w-5 text-gray-300 shrink-0" />
          )}
        </div>

        <div
          className="bg-white border rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer active:bg-gray-50"
          onClick={() => copyToClipboard(wifiPassword, "password")}
          data-testid="wifi-password-copy"
        >
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Senha</p>
            <p className="font-mono font-semibold text-gray-800 text-lg">{wifiPassword || "—"}</p>
          </div>
          {copied === "password" ? (
            <Check className="h-5 w-5 text-green-500 shrink-0" />
          ) : (
            <Copy className="h-5 w-5 text-gray-300 shrink-0" />
          )}
        </div>

        <p className="text-center text-xs text-gray-400">Toque para copiar</p>
      </div>
    </div>
  );
}

function RulesSection({
  rules,
  onBack,
}: {
  rules: { id: number; order: number; title: string; description: string; category: string }[];
  onBack: () => void;
}) {
  const sorted = [...rules].sort((a, b) => a.order - b.order);
  const categories = Array.from(new Set(sorted.map((r) => r.category)));

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SectionHeader title="Regras" sectionId="rules" onBack={onBack} />
      <div className="p-5 space-y-5">
        <div className="bg-red-700 rounded-2xl p-4 text-center text-white">
          <p className="font-semibold">Obrigado por respeitar as regras da casa.</p>
        </div>
        {categories.map((cat) => (
          <div key={cat}>
            <p className="text-xs font-bold uppercase tracking-widest text-red-700 mb-2 px-1">{cat}</p>
            <div className="space-y-3">
              {sorted
                .filter((r) => r.category === cat)
                .map((rule, idx) => (
                  <div key={rule.id} className="bg-white border rounded-2xl p-4 shadow-sm flex gap-3">
                    <span className="text-2xl font-black text-red-200 leading-none w-8 shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-0.5">{rule.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{rule.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-center text-gray-400 py-12">Nenhuma regra cadastrada.</p>
        )}
      </div>
    </div>
  );
}

const TIP_CATEGORY_META: Record<string, { icon: typeof Utensils; color: string }> = {
  Restaurante: { icon: Utensils, color: "#15803d" },
  Café: { icon: Coffee, color: "#b45309" },
  Transporte: { icon: Bus, color: "#0369a1" },
  Compras: { icon: ShoppingBag, color: "#7c3aed" },
  Atração: { icon: Star, color: "#c2410c" },
  Geral: { icon: MapPin, color: "#374151" },
};

function TipsSection({
  tips,
  onBack,
}: {
  tips: LocalTip[];
  onBack: () => void;
}) {
  const nonEmergency = tips.filter((t) => t.category !== "Emergência");
  const categories = Array.from(new Set(nonEmergency.map((t) => t.category)));

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SectionHeader title="Dicas Locais" sectionId="tips" onBack={onBack} />
      <div className="p-5 space-y-6">
        {nonEmergency.length === 0 && (
          <p className="text-center text-gray-400 py-12">Nenhuma dica cadastrada.</p>
        )}
        {categories.map((cat) => {
          const meta = TIP_CATEGORY_META[cat] ?? TIP_CATEGORY_META["Geral"];
          const Icon = meta.icon;
          const catTips = nonEmergency.filter((t) => t.category === cat);
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4" style={{ color: meta.color }} />
                <p className="font-bold text-sm uppercase tracking-wide" style={{ color: meta.color }}>
                  {cat}
                </p>
              </div>
              <div className="space-y-3">
                {catTips.map((tip) => (
                  <div key={tip.id} className="bg-white border rounded-2xl p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-1">{tip.title}</h4>
                    {tip.address && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-1.5">
                        <MapPin className="h-3 w-3 shrink-0" /> {tip.address}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 leading-relaxed">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmergencySection({
  tips,
  onBack,
}: {
  tips: LocalTip[];
  onBack: () => void;
}) {
  const emergencyTips = tips.filter((t) => t.category === "Emergência");

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SectionHeader title="Emergências" sectionId="emergency" onBack={onBack} />
      <div className="p-5 space-y-4">
        <div className="bg-red-600 rounded-2xl p-5">
          <p className="text-white font-bold text-center mb-4">Números de emergência</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: "192", label: "SAMU" },
              { num: "190", label: "Polícia" },
              { num: "193", label: "Bombeiros" },
            ].map(({ num, label }) => (
              <a
                key={num}
                href={`tel:${num}`}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-3 text-center block transition-colors"
              >
                <p className="text-2xl font-black text-white">{num}</p>
                <p className="text-[10px] text-white/80 uppercase tracking-wide">{label}</p>
              </a>
            ))}
          </div>
        </div>

        {emergencyTips.length > 0 && (
          <div className="space-y-3">
            {emergencyTips.map((tip) => (
              <div key={tip.id} className="bg-white border rounded-2xl p-4 shadow-sm flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-0.5">{tip.title}</h4>
                  {tip.address && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3" /> {tip.address}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 leading-relaxed">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {emergencyTips.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4">
            Adicione locais de emergência na seção "Dicas Locais" com a categoria "Emergência".
          </p>
        )}
      </div>
    </div>
  );
}

function FAQSection({
  items,
  onBack,
}: {
  items: { id: number; question: string; answer: string; order: number }[];
  onBack: () => void;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SectionHeader title="Dúvidas Frequentes" sectionId="faq" onBack={onBack} />
      <div className="p-5 space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma dúvida cadastrada.</p>
          </div>
        ) : (
          sorted.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className="h-7 w-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <HelpCircle className="h-4 w-4 text-violet-600" />
                  </div>
                  <p className="flex-1 font-semibold text-gray-800 text-sm leading-snug">{item.question}</p>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="ml-10 border-l-2 border-violet-100 pl-3">
                      <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ContactSection({
  property,
  onBack,
}: {
  property: { name: string; contactPhone?: string | null; contactEmail?: string | null; reviewUrl?: string | null };
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SectionHeader title="Contato" sectionId="contact" onBack={onBack} />
      <div className="p-5 space-y-4">
        <div className="bg-teal-700 rounded-2xl p-6 text-center text-white">
          <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Home className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-bold text-lg">{property.name}</h3>
          <p className="text-sm opacity-75 mt-1">Estamos sempre disponíveis para ajudar.</p>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            Se tiver alguma dúvida ou precisar de ajuda durante sua estadia, não hesite em entrar em contato.
          </p>
          {property.contactPhone && (
            <a
              href={`tel:${property.contactPhone}`}
              className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
              data-testid="link-contact-phone"
            >
              <Phone className="h-5 w-5 text-teal-700 shrink-0" />
              <div>
                <p className="text-xs text-teal-600 uppercase tracking-wide">Telefone / WhatsApp</p>
                <p className="font-semibold text-teal-800">{property.contactPhone}</p>
              </div>
            </a>
          )}
          {property.contactEmail && (
            <a
              href={`mailto:${property.contactEmail}`}
              className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
              data-testid="link-contact-email"
            >
              <Mail className="h-5 w-5 text-teal-700 shrink-0" />
              <div>
                <p className="text-xs text-teal-600 uppercase tracking-wide">E-mail</p>
                <p className="font-semibold text-teal-800">{property.contactEmail}</p>
              </div>
            </a>
          )}
          {!property.contactPhone && !property.contactEmail && (
            <p className="text-gray-400 text-sm text-center py-2">Contato não informado.</p>
          )}
        </div>

        {property.reviewUrl ? (
          <a
            href={property.reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 transition-colors rounded-2xl p-5 shadow-sm"
            data-testid="link-review"
          >
            <div className="h-12 w-12 bg-white/30 rounded-xl flex items-center justify-center shrink-0">
              <Star className="h-6 w-6 text-amber-900" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-900 text-base">Deixar uma avaliação</p>
              <p className="text-amber-800 text-xs mt-0.5">Sua opinião faz toda a diferença! ⭐</p>
            </div>
            <ExternalLink className="h-4 w-4 text-amber-800 shrink-0" />
          </a>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
            <p className="text-sm text-amber-800">
              Esperamos que você tenha uma estadia incrível! Deixe uma avaliação no Airbnb. ⭐
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function HomeScreen({
  propertyName,
  coverImageUrl,
  welcomeMessage,
  onNavigate,
}: {
  propertyName: string;
  coverImageUrl?: string | null;
  welcomeMessage?: string | null;
  onNavigate: (section: Section) => void;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(160deg, #1a1035 0%, #0f2027 50%, #1a1035 100%)",
      }}
    >
      {coverImageUrl && (
        <div className="relative h-52 w-full overflow-hidden">
          <img
            src={coverImageUrl}
            alt={propertyName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-[#1a1035]" />
        </div>
      )}
      <div className={`px-6 pb-4 text-center ${coverImageUrl ? "pt-4" : "pt-10"}`}>
        <p className="text-white/50 text-xs uppercase tracking-[0.25em] mb-2">Bem-vindo ao</p>
        <h1 className="text-white text-2xl font-bold leading-tight">{propertyName}</h1>
        <p className="text-white/40 text-xs mt-2 uppercase tracking-widest">Guia de Boas-Vindas</p>
      </div>

      {welcomeMessage && (
        <div className="mx-5 mb-4">
          <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm px-5 py-4">
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Mensagem do anfitrião</p>
            <p className="text-white/90 text-sm leading-relaxed italic">"{welcomeMessage}"</p>
          </div>
        </div>
      )}

      <div className="flex-1 px-5 pb-10">
        <div className="grid grid-cols-3 gap-4">
          {HOME_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                data-testid={`nav-${section.id}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg group-active:scale-95 transition-transform"
                  style={{ backgroundColor: section.bg }}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <span className="text-white/70 text-[11px] text-center leading-tight font-medium">
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center pb-8">
        <p className="text-white/20 text-[10px] uppercase tracking-widest">Fique, Explore e Aproveite</p>
      </div>
    </div>
  );
}

export default function GuestPortal() {
  const { data: portal, isLoading } = useGetGuestPortal();
  const createNotification = useCreateCheckoutNotification();
  const [section, setSection] = useState<Section>("home");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#1a1035]">
        <Skeleton className="h-6 w-48 bg-white/10" />
        <div className="grid grid-cols-3 gap-4 p-5 w-full max-w-xs">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-16 rounded-2xl bg-white/10 mx-auto" />
          ))}
        </div>
      </div>
    );
  }

  if (!portal || !portal.property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1035]">
        <div className="text-center">
          <Home className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">Informações não disponíveis</p>
        </div>
      </div>
    );
  }

  const { property, checkinSteps, checkoutSteps, rules, localTips, faqItems } = portal;

  function goBack() {
    setSection("home");
  }

  if (section === "home") {
    return (
      <HomeScreen
        propertyName={property.name}
        coverImageUrl={property.coverImageUrl}
        welcomeMessage={property.welcomeMessage}
        onNavigate={setSection}
      />
    );
  }
  if (section === "welcome") {
    return <WelcomeSection property={property} onBack={goBack} />;
  }
  if (section === "checkin") {
    return <CheckinSection steps={checkinSteps} onBack={goBack} />;
  }
  if (section === "checkout") {
    return <CheckoutSection steps={checkoutSteps} checkOutTime={property.checkOutTime} checkoutNotes={property.checkoutNotes} reviewUrl={property.reviewUrl} onNotifyCheckout={() => createNotification.mutate()} onBack={goBack} />;
  }
  if (section === "wifi") {
    return <WifiSection wifiName={property.wifiName} wifiPassword={property.wifiPassword} onBack={goBack} />;
  }
  if (section === "rules") {
    return <RulesSection rules={rules} onBack={goBack} />;
  }
  if (section === "tips") {
    return <TipsSection tips={localTips} onBack={goBack} />;
  }
  if (section === "emergency") {
    return <EmergencySection tips={localTips} onBack={goBack} />;
  }
  if (section === "contact") {
    return <ContactSection property={property} onBack={goBack} />;
  }
  if (section === "faq") {
    return <FAQSection items={faqItems} onBack={goBack} />;
  }

  return null;
}
