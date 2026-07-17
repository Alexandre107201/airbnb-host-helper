import { 
  useListLocalTips, 
  useCreateLocalTip, 
  useUpdateLocalTip, 
  useDeleteLocalTip,
  getListLocalTipsQueryKey
} from "@workspace/api-client-react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, MapPin } from "lucide-react";

const CATEGORIES = ["Restaurante", "Café", "Transporte", "Atração", "Compras", "Emergência"];

const tipSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  category: z.string().min(1, "A categoria é obrigatória"),
  address: z.string().optional(),
});

export default function Tips() {
  const { data: tips, isLoading } = useListLocalTips();
  const createTip = useCreateLocalTip();
  const updateTip = useUpdateLocalTip();
  const deleteTip = useDeleteLocalTip();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof tipSchema>>({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Restaurante",
      address: "",
    },
  });

  const handleOpenNew = () => {
    setEditingId(null);
    form.reset({
      title: "",
      description: "",
      category: "Restaurante",
      address: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (tip: any) => {
    setEditingId(tip.id);
    form.reset({
      title: tip.title,
      description: tip.description,
      category: tip.category,
      address: tip.address || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta dica?")) {
      deleteTip.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListLocalTipsQueryKey() });
            toast({ title: "Dica excluída com sucesso." });
          },
        }
      );
    }
  };

  const onSubmit = (data: z.infer<typeof tipSchema>) => {
    if (editingId) {
      updateTip.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListLocalTipsQueryKey() });
            setIsDialogOpen(false);
            toast({ title: "Dica atualizada com sucesso." });
          },
        }
      );
    } else {
      createTip.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListLocalTipsQueryKey() });
            setIsDialogOpen(false);
            toast({ title: "Dica criada com sucesso." });
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Dicas Locais</h1>
            <p className="text-muted-foreground mt-2">
              Compartilhe seus lugares favoritos com os hóspedes.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNew}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Dica
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Dica" : "Nova Dica"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Local</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Padaria da Esquina" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua e número..." {...field} />
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
                        <FormLabel>Por que você recomenda?</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tem o melhor pão de queijo da região..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={createTip.isPending || updateTip.isPending}>
                      Salvar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {(!tips || tips.length === 0) ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
            <p className="text-muted-foreground">Nenhuma dica cadastrada.</p>
            <Button variant="outline" className="mt-4" onClick={handleOpenNew}>Adicionar a primeira dica</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip) => (
              <Card key={tip.id} className="group">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded w-fit inline-block">
                        {tip.category}
                      </span>
                      <h3 className="font-semibold text-lg leading-tight">{tip.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(tip)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(tip.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {tip.address && (
                    <p className="text-xs text-muted-foreground flex items-center mb-3">
                      <MapPin className="h-3 w-3 mr-1 inline" />
                      {tip.address}
                    </p>
                  )}
                  
                  <p className="text-sm mt-auto text-foreground/80">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
