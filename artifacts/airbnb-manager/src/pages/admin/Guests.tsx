import {
  useListGuests,
  useCreateGuest,
  useUpdateGuest,
  useDeleteGuest,
  getListGuestsQueryKey,
} from "@workspace/api-client-react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, Users, CalendarDays, Clock, MessageCircle, CheckCircle2 } from "lucide-react";

const guestSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  checkIn: z.string().min(1, "A data de check-in é obrigatória"),
  checkOut: z.string().min(1, "A data de check-out é obrigatória"),
  notes: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getNights(checkIn: string, checkOut: string) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function getStayStatus(checkIn: string, checkOut: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (now < inDate) return "upcoming";
  if (now <= outDate) return "active";
  return "past";
}

function sendWhatsApp(name: string) {
  const greeting = name.trim() ? `Olá, ${name.trim()}! 👋` : `Olá! 👋`;
  const guestUrl = `${window.location.origin}/guest`;
  const message = encodeURIComponent(
    `${greeting} Aqui está o guia completo do apartamento para a sua estadia. Tudo que você precisa saber está neste link:\n\n${guestUrl}\n\nBoa estadia! 🏠`
  );
  window.open(`https://wa.me/?text=${message}`, "_blank");
}

export default function Guests() {
  const { data: guests, isLoading } = useListGuests();
  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest();
  const deleteGuest = useDeleteGuest();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [justCreatedName, setJustCreatedName] = useState<string | null>(null);

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: { name: "", checkIn: "", checkOut: "", notes: "" },
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setJustCreatedName(null);
    form.reset({ name: "", checkIn: "", checkOut: "", notes: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (g: {
    id: number;
    name: string;
    checkIn: string;
    checkOut: string;
    notes?: string | null;
  }) => {
    setEditingId(g.id);
    setJustCreatedName(null);
    form.reset({
      name: g.name,
      checkIn: g.checkIn,
      checkOut: g.checkOut,
      notes: g.notes ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setJustCreatedName(null);
  };

  const onSubmit = (data: GuestFormData) => {
    const key = getListGuestsQueryKey();
    const payload = { ...data, notes: data.notes || undefined };

    if (editingId !== null) {
      updateGuest.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: key });
            toast({ title: "Atualizado", description: "Registro atualizado." });
            handleCloseDialog();
          },
          onError: () =>
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar." }),
        }
      );
    } else {
      createGuest.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: key });
            setJustCreatedName(data.name);
          },
          onError: () =>
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível registrar." }),
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteGuest.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey() });
          toast({ title: "Removido", description: "Registro removido." });
        },
        onError: () =>
          toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover." }),
      }
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </AdminLayout>
    );
  }

  const statusConfig = {
    active: { label: "Hospedado agora", className: "bg-green-100 text-green-800 border-green-200" },
    upcoming: { label: "Próxima estadia", className: "bg-blue-100 text-blue-800 border-blue-200" },
    past: { label: "Concluída", className: "bg-muted text-muted-foreground border-border" },
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hóspedes</h1>
          <p className="text-muted-foreground mt-1">
            Histórico de reservas e estadias no seu apê.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} data-testid="btn-add-guest">
              <Plus className="mr-2 h-4 w-4" /> Registrar Hóspede
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            {justCreatedName !== null ? (
              /* ── Passo 2: sucesso + WhatsApp ── */
              <div className="flex flex-col items-center text-center gap-5 py-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-9 w-9 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Hóspede registrado!</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    <span className="font-medium text-foreground">{justCreatedName}</span> foi adicionado ao histórico.
                  </p>
                </div>

                <div className="w-full rounded-xl border bg-muted/40 p-4 text-left space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Prévia da mensagem</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    "Olá, <span className="font-medium">{justCreatedName}</span>! 👋 Aqui está o guia completo do apartamento para a sua estadia..."
                  </p>
                </div>

                <div className="w-full space-y-2">
                  <Button
                    className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white"
                    onClick={() => {
                      sendWhatsApp(justCreatedName);
                      handleCloseDialog();
                    }}
                    data-testid="btn-whatsapp-after-create"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Enviar link pelo WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCloseDialog}
                    data-testid="btn-skip-whatsapp"
                  >
                    Agora não
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Passo 1: formulário ── */
              <>
                <DialogHeader>
                  <DialogTitle>
                    {editingId !== null ? "Editar Registro" : "Novo Hóspede"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do hóspede</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: João e Maria Silva"
                              data-testid="input-guest-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="checkIn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check-in</FormLabel>
                            <FormControl>
                              <Input type="date" data-testid="input-guest-checkin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="checkOut"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check-out</FormLabel>
                            <FormControl>
                              <Input type="date" data-testid="input-guest-checkout" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Observações{" "}
                            <span className="text-muted-foreground font-normal">(opcional)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: Viajando a trabalho, check-in tardio às 22h..."
                              className="min-h-[80px]"
                              data-testid="input-guest-notes"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createGuest.isPending || updateGuest.isPending}
                        data-testid="btn-save-guest"
                      >
                        {createGuest.isPending || updateGuest.isPending ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary strip */}
      {(guests?.length ?? 0) > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(["active", "upcoming", "past"] as const).map((status) => {
            const count = (guests ?? []).filter(
              (g) => getStayStatus(g.checkIn, g.checkOut) === status
            ).length;
            const labels = { active: "Hospedados agora", upcoming: "Próximas", past: "Concluídas" };
            return (
              <Card key={status} className="text-center py-1">
                <CardContent className="pt-4 pb-3">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{labels[status]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {(guests?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">Nenhum hóspede registrado</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Registre suas reservas para manter o histórico de estadias.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(guests ?? []).map((g) => {
            const status = getStayStatus(g.checkIn, g.checkOut);
            const cfg = statusConfig[status];
            const nights = getNights(g.checkIn, g.checkOut);
            return (
              <Card key={g.id} className={status === "active" ? "border-green-200 bg-green-50/30" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{g.name}</p>
                        <Badge variant="outline" className={`text-xs ${cfg.className}`}>
                          {cfg.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(g.checkIn)} → {formatDate(g.checkOut)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {nights} {nights === 1 ? "noite" : "noites"}
                        </span>
                      </div>
                      {g.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic leading-relaxed">
                          {g.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Enviar link pelo WhatsApp"
                        onClick={() => sendWhatsApp(g.name)}
                        data-testid={`btn-whatsapp-guest-${g.id}`}
                        className="text-[#25D366] hover:text-[#1ebe5d] hover:bg-green-50"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(g)}
                        data-testid={`btn-edit-guest-${g.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(g.id)}
                        data-testid={`btn-delete-guest-${g.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
