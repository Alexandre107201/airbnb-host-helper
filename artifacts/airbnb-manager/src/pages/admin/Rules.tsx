import { 
  useListRules, 
  useCreateRule, 
  useUpdateRule, 
  useDeleteRule,
  getListRulesQueryKey
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
import { Pencil, Trash2, Plus, GripVertical } from "lucide-react";

const CATEGORIES = ["Silêncio", "Limpeza", "Hóspedes", "Animais", "Geral"];

const ruleSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  category: z.string().min(1, "A categoria é obrigatória"),
  order: z.coerce.number().min(1, "Ordem é obrigatória"),
});

export default function Rules() {
  const { data: rules, isLoading } = useListRules();
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof ruleSchema>>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Geral",
      order: 1,
    },
  });

  const handleOpenNew = () => {
    setEditingId(null);
    form.reset({
      title: "",
      description: "",
      category: "Geral",
      order: (rules?.length || 0) + 1,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (rule: any) => {
    setEditingId(rule.id);
    form.reset({
      title: rule.title,
      description: rule.description,
      category: rule.category,
      order: rule.order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta regra?")) {
      deleteRule.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListRulesQueryKey() });
            toast({ title: "Regra excluída com sucesso." });
          },
        }
      );
    }
  };

  const onSubmit = (data: z.infer<typeof ruleSchema>) => {
    if (editingId) {
      updateRule.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListRulesQueryKey() });
            setIsDialogOpen(false);
            toast({ title: "Regra atualizada com sucesso." });
          },
        }
      );
    } else {
      createRule.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListRulesQueryKey() });
            setIsDialogOpen(false);
            toast({ title: "Regra criada com sucesso." });
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

  const sortedRules = [...(rules || [])].sort((a, b) => a.order - b.order);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Regras da Casa</h1>
            <p className="text-muted-foreground mt-2">
              Defina os limites e as boas práticas do seu imóvel.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNew}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Regra" : "Nova Regra"}</DialogTitle>
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
                          <Input placeholder="Ex: Horário de Silêncio" {...field} />
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
                          <Textarea placeholder="Detalhes da regra..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={createRule.isPending || updateRule.isPending}>
                      Salvar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {sortedRules.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
            <p className="text-muted-foreground">Nenhuma regra cadastrada.</p>
            <Button variant="outline" className="mt-4" onClick={handleOpenNew}>Adicionar a primeira regra</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRules.map((rule) => (
              <Card key={rule.id} className="group">
                <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 cursor-move text-muted-foreground/50">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{rule.title}</h3>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded w-fit">
                        {rule.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">{rule.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(rule.id)}>
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
