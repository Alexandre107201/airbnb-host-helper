import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Download, QrCode, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function getGuestUrl() {
  return `${window.location.origin}/guest`;
}

export function ShareGuestLink() {
  const [copied, setCopied] = useState(false);
  const [guestName, setGuestName] = useState("");
  const qrRef = useRef<SVGSVGElement>(null);
  const guestUrl = getGuestUrl();

  function handleCopy() {
    navigator.clipboard.writeText(guestUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleWhatsApp() {
    const greeting = guestName.trim()
      ? `Olá, ${guestName.trim()}! 👋`
      : `Olá! 👋`;
    const message = encodeURIComponent(
      `${greeting} Aqui está o guia completo do apartamento para a sua estadia. Tudo que você precisa saber está neste link:\n\n${guestUrl}\n\nBoa estadia! 🏠`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  }

  function handleDownload() {
    const svg = qrRef.current;
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode-hospedes.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog onOpenChange={(open) => { if (!open) setGuestName(""); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-primary border-primary/20 hover:bg-primary/5"
          data-testid="button-share-guest"
        >
          <QrCode className="mr-3 h-5 w-5" />
          Compartilhar com hóspedes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Link para Hóspedes</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <QRCodeSVG
              ref={qrRef}
              value={guestUrl}
              size={200}
              fgColor="#7c2d12"
              bgColor="#ffffff"
              level="M"
              data-testid="qrcode-guest"
            />
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Escaneie o QR Code ou copie o link abaixo e envie para seus hóspedes antes da chegada.
          </p>

          <div className="w-full flex items-center gap-2">
            <div
              className="flex-1 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground truncate font-mono"
              data-testid="text-guest-url"
            >
              {guestUrl}
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopy}
              data-testid="button-copy-url"
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="w-full space-y-1.5">
            <Label htmlFor="guest-name" className="text-sm font-medium">
              Nome do hóspede <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="guest-name"
              placeholder="Ex: João e Maria"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              data-testid="input-guest-name"
            />
            {guestName.trim() && (
              <p className="text-[11px] text-muted-foreground italic px-0.5">
                Prévia: "Olá, {guestName.trim()}! 👋 Aqui está o guia completo..."
              </p>
            )}
          </div>

          <Button
            className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white"
            onClick={handleWhatsApp}
            data-testid="button-whatsapp-share"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Enviar pelo WhatsApp
          </Button>

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleDownload}
            data-testid="button-download-qr"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
