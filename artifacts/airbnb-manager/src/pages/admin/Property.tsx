import { useGetProperty, useUpdateProperty, getGetPropertyQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useEffect, useState, useRef } from "react";
import { ImageIcon, Upload, Loader2 } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";

const propertySchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  address: z.string().min(1, "O endereço é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  checkInTime: z.string().min(1, "Horário de check-in é obrigatório"),
  checkOutTime: z.string().min(1, "Horário de check-out é obrigatório"),
  maxGuests: z.coerce.number().min(1, "Número de hóspedes é obrigatório"),
  wifiName: z.string().min(1, "Nome do Wi-Fi é obrigatório"),
  wifiPassword: z.string().min(1, "Senha do Wi-Fi é obrigatória"),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  coverImageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  welcomeMessage: z.string().optional(),
  reviewUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  checkoutNotes: z.string().optional(),
});

export default function Property() {
  const { data: property, isLoading } = useGetProperty();
  const updateProperty = useUpdateProperty();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      const url = `/api/storage${response.objectPath}`;
      form.setValue("coverImageUrl", url, { shouldDirty: true });
      setImagePreview(url);
      toast({ title: "Foto enviada com sucesso!" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro ao enviar a foto.", description: "Tente novamente." });
    },
  });

  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      checkInTime: "",
      checkOutTime: "",
      maxGuests: 1,
      wifiName: "",
      wifiPassword: "",
      contactPhone: "",
      contactEmail: "",
      coverImageUrl: "",
      welcomeMessage: "",
      reviewUrl: "",
      checkoutNotes: "",
    },
  });

  useEffect(() => {
    if (property) {
      const url = property.coverImageUrl || "";
      form.reset({
        name: property.name,
        address: property.address,
        description: property.description,
        checkInTime: property.checkInTime,
        checkOutTime: property.checkOutTime,
        maxGuests: property.maxGuests,
        wifiName: property.wifiName,
        wifiPassword: property.wifiPassword,
        contactPhone: property.contactPhone || "",
        contactEmail: property.contactEmail || "",
        coverImageUrl: url,
        welcomeMessage: property.welcomeMessage || "",
        reviewUrl: property.reviewUrl || "",
        checkoutNotes: property.checkoutNotes || "",
      });
      setImagePreview(url);
    }
  }, [property, form]);

  const onSubmit = (data: z.infer<typeof propertySchema>) => {
    updateProperty.mutate(
      { data },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetPropertyQueryKey(), updated);
          toast({
            title: "Sucesso",
            description: "Informações do imóvel atualizadas.",
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível atualizar o imóvel.",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-[600px] w-full" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Meu Apê</h1>
          <p className="text-muted-foreground mt-2">
            Configure as informações principais do seu imóvel.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
            <CardDescription>Estes dados serão visíveis para os seus hóspedes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Imóvel</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Aconchego na Praia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxGuests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máximo de Hóspedes</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Endereço Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Número, Bairro, Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descreva seu espaço com carinho..." className="min-h-[100px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkInTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de Check-in</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 15:00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkOutTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de Check-out</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 11:00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wifiName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Rede Wi-Fi</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da rede" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wifiPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha do Wi-Fi</FormLabel>
                        <FormControl>
                          <Input placeholder="Senha da rede" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone de Contato (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail de Contato (opcional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contato@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="welcomeMessage"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Mensagem de Boas-Vindas (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Seja bem-vindo(a)! Estou muito feliz em recebê-lo(a). Fique à vontade como se estivesse em casa..."
                            className="min-h-[100px]"
                            data-testid="input-welcome-message"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Mensagem pessoal para os hóspedes. Aparece em destaque assim que eles abrem o guia.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkoutNotes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Recado de Saída (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Deixe a chave na portaria com o Sr. João. Não esqueça de desligar o ar-condicionado antes de sair!"
                            className="min-h-[90px]"
                            data-testid="input-checkout-notes"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Recado personalizado exibido em destaque na seção de Check-out do guia — acima da lista de tarefas.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reviewUrl"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Link de Avaliação no Airbnb (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://www.airbnb.com.br/..."
                            data-testid="input-review-url"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Cole o link direto para a avaliação do seu imóvel no Airbnb. Aparecerá como botão destacado na seção de Contato do guia.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Foto de Capa (opcional)</FormLabel>

                        {/* Upload area */}
                        <div
                          className="mt-1 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer relative overflow-hidden"
                          style={{ minHeight: "180px" }}
                          onClick={() => !isUploading && fileInputRef.current?.click()}
                          data-testid="upload-cover-dropzone"
                        >
                          {imagePreview ? (
                            <>
                              <img
                                src={imagePreview}
                                alt="Foto de capa"
                                className="w-full h-44 object-cover"
                                onError={() => setImagePreview("")}
                                data-testid="img-cover-preview"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <Upload className="h-6 w-6 text-white" />
                                <p className="text-white text-xs font-medium">Clique para trocar a foto</p>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-3 h-44 text-muted-foreground">
                              {isUploading ? (
                                <>
                                  <Loader2 className="h-8 w-8 animate-spin opacity-50" />
                                  <p className="text-xs">Enviando foto...</p>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="h-8 w-8 opacity-30" />
                                  <div className="text-center">
                                    <p className="text-sm font-medium">Clique para escolher uma foto</p>
                                    <p className="text-xs opacity-60 mt-0.5">JPG, PNG ou WebP</p>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          data-testid="input-cover-image-file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadFile(file);
                            e.target.value = "";
                          }}
                        />

                        {/* Manual URL input as fallback */}
                        <div className="flex gap-2 items-center">
                          <FormControl>
                            <Input
                              placeholder="Ou cole uma URL de imagem aqui..."
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setImagePreview(e.target.value);
                              }}
                              data-testid="input-cover-image-url"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="shrink-0"
                          >
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            <span className="ml-1.5 hidden sm:inline">Upload</span>
                          </Button>
                        </div>

                        <FormDescription>
                          Envie uma foto do seu apartamento — ela aparece na tela inicial do guia dos hóspedes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updateProperty.isPending}>
                    {updateProperty.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
