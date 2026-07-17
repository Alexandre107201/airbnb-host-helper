import {
  useListFaqItems,
  useCreateFaqItem,
  useUpdateFaqItem,
  useDeleteFaqItem,
  getListFaqItemsQueryKey,
} from "@workspace/api-client-react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, HelpCircle } from "lucide-react";

const faqSchema = z.object({
  question: z.string().min(1, "A pergunta é obrigatória"),
  answer: z.string().min(1, "A resposta é obrigatória"),
  order: z.coerce.number().min(1, "Ordem é obrigatória"),
});

export default function FAQ() {
  const { data: items, isLoading } = useListFaqItems();
  const createItem = useCreateFaqItem();
  const updateItem = useUpdateFaqItem();
  const deleteItem = useDeleteFaqItem();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof faqSchema>>({
    resolver: zodResolver(faqSchema),
    defaultValues: { question: "", answer: "", order: 1 },
  });

  const handleOpenNew = () => {
    setEditingId(null);
    form.reset({ question: "", answer: "", order: (items?.length ?? 0) + 1 });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: { id: number; question: string; answer: string; order: number }) => {
    setEditingId(item.id);
    form.reset({ question: item.question, answer: item.answer, order: item.order });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: z.infer<typeof faqSchema>) => {
    const key = getListFaqItemsQueryKey();
    if (editingId !== null) {
      updateItem.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: key });
            toast({ title: "Atualizado", description: "Pergunta atualizada." });
            setIsDialogOpen(false);
          },
          onError: () => toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar." }),
        }
      );
    } else {
      createItem.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: key });
            toast({ title: "Criado", description: "Pergunta adicionada." });
            setIsDialogOpen(false);
          },
          onError: () => toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar." }),
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFaqItemsQueryKey() });
          toast({ title: "Removido", description: "Pergunta removida." });
        },
        onError: () => toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover." }),
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

  const sorted = [...(items ?? [])].sort((a, b) => a.order - b.order);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Perguntas Frequentes</h1>
          <p className="text-muted-foreground mt-1">
            Adicione perguntas e respostas para ajudar seus hóspedes.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} data-testid="btn-add-faq">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Pergunta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId !== null ? "Editar Pergunta" : "Nova Pergunta"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pergunta</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Tem estacionamento?" data-testid="input-faq-question" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resposta</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Sim, há uma vaga de garagem disponível incluída na diária."
                          className="min-h-[100px]"
                          data-testid="input-faq-answer"
                          {...field}
                        />
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
                        <Input type="number" min={1} data-testid="input-faq-order" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                    {createItem.isPending || updateItem.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">Nenhuma pergunta cadastrada</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Adicione perguntas frequentes para ajudar seus hóspedes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((item, idx) => (
            <Card key={item.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{item.question}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.answer}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(item)}
                      data-testid={`btn-edit-faq-${item.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                      data-testid={`btn-delete-faq-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
