import { 
  useListCheckoutSteps, 
  useCreateCheckoutStep, 
  useUpdateCheckoutStep, 
  useDeleteCheckoutStep,
  getListCheckoutStepsQueryKey
} from "@workspace/api-client-react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, GripVertical, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const stepSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  icon: z.string().optional(),
  order: z.coerce.number().min(1, "Ordem é obrigatória"),
  requiresConfirmation: z.boolean().default(false),
});

export default function CheckoutSteps() {
  const { data: steps, isLoading } = useListCheckoutSteps();
  const createStep = useCreateCheckoutStep();
  const updateStep = useUpdateCheckoutStep();
  const deleteStep = useDeleteCheckoutStep();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof stepSchema>>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "",
      order: 1,
      requiresConfirmation: false,
    },
  });

  const handleOpenNew = () => {
    setEditingId(null);
    form.reset({
      title: "",
      description: "",
      icon: "",
      order: (steps?.length || 0) + 1,
      requiresConfirmation: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (step: { id: number; title: string; description: string; icon?: string | null; order: number; requiresConfirmation?: boolean | null }) => {
    setEditingId(step.id);
    form.reset({
      title: step.title,
      description: step.description,
      icon: step.icon || "",
      order: step.order,
      requiresConfirmation: step.requiresConfirmation ?? false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este passo?")) {
      deleteStep.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListCheckoutStepsQueryKey() });
            toast({ title: "Passo excluído com sucesso." });
          },
        }
      );
    }
  };

  const onSubmit = (data: z.infer<typeof stepSchema>) => {
    if (editingId) {
      updateStep.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListCheckoutStepsQueryKey() });
            setIsDialogOpen(false);
            toast({ title: "Passo atualizado com sucesso." });
          },
        }
      );
    } else {
      createStep.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListCheckoutStepsQueryKey() });
            setIsDialogOpen(false);
            toast({ title: "Passo criado com sucesso." });
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </AdminLayout>
    );
  }

  const sortedSteps = [...(steps || [])].sort((a, b) => a.order - b.order);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Passos de Check-out</h1>
            <p className="text-muted-foreground mt-2">
              Instruções para quando os hóspedes deixarem o imóvel.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNew}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Passo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Passo" : "Novo Passo"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Desligue o ar condicionado" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Instruções detalhadas..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ícone (Emoji) - Opcional</FormLabel>
                          <FormControl>
                            <Input placeholder="❄️" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ordem</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="requiresConfirmation"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-xl border p-4 bg-purple-50 border-purple-200">
                        <div className="space-y-0.5">
                          <FormLabel className="text-purple-900 font-semibold flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4" />
                            Exige confirmação do hóspede
                          </FormLabel>
                          <FormDescription className="text-purple-700 text-xs">
                            O hóspede terá que marcar este passo antes de liberar o botão "Apartamento entregue!".
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={createStep.isPending || updateStep.isPending}>
                      {createStep.isPending || updateStep.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {sortedSteps.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
            <p className="text-muted-foreground">Nenhum passo de check-out cadastrado.</p>
            <Button variant="outline" className="mt-4" onClick={handleOpenNew}>Adicionar o primeiro passo</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSteps.map((step) => (
              <Card key={step.id} className="group">
                <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 cursor-move text-muted-foreground/50">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold h-5 w-5 rounded-full">
                        {step.order}
                      </span>
                      <h3 className="font-semibold text-lg">{step.title} {step.icon}</h3>
                      {step.requiresConfirmation && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-purple-700 bg-purple-100 border border-purple-200 rounded-full px-2 py-0.5">
                          <ShieldCheck className="h-3 w-3" /> Confirmação obrigatória
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">{step.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(step)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(step.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
