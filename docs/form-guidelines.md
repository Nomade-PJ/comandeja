# Diretrizes de Formulários

Este documento define as boas práticas e padrões para criação e manutenção de formulários no projeto ComandeJá.

## Princípios Gerais

- **Consistência**: Todos os formulários devem seguir a mesma estrutura e comportamento.
- **Acessibilidade**: Formulários devem ser acessíveis para todos os usuários.
- **Validação**: Implementar validação adequada para todos os campos.
- **Feedback**: Fornecer feedback claro ao usuário sobre erros e sucesso.

## Componentes a Serem Utilizados

### 1. Para Formulários Simples

Utilize o componente `ContactForm` para formulários de contato e formulários simples:

```tsx
import { ContactForm, FormField } from "@/components/ui/contact-form";

// Definir os campos do formulário
const formFields: FormField[] = [
  {
    name: "name",
    label: "Nome",
    type: "text",
    placeholder: "Seu nome",
    required: true,
    colSpan: 1
  },
  // Mais campos...
];

// Utilizar o componente
<ContactForm 
  title="Título do Formulário"
  description="Descrição do formulário"
  fields={formFields}
  submitButtonText="Enviar"
/>
```

### 2. Para Formulários Complexos com Validação

Utilize a combinação de `react-hook-form` com `zod` para validação:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Definir o esquema de validação
const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  // Mais validações...
});

// Criar o formulário
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    username: "",
    email: "",
    // Valores padrão...
  },
});

// Utilizar o componente Form
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome de usuário</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    {/* Mais campos... */}
    <Button type="submit">Enviar</Button>
  </form>
</Form>
```

## Validação

- Utilize o `zod` para validação de dados.
- Defina esquemas de validação claros e reutilizáveis.
- Mantenha esquemas de validação em arquivos separados para reutilização.

## Estilização

- Utilize os componentes do Shadcn UI para manter a consistência visual.
- Mantenha o espaçamento consistente entre campos (utilize `space-y-4` ou `space-y-6`).
- Utilize grids para organizar campos lado a lado quando apropriado.

## Feedback ao Usuário

- Mostre mensagens de erro claras e específicas.
- Indique campos obrigatórios com asterisco (*).
- Forneça feedback visual instantâneo durante a digitação.
- Utilize toasts para notificações de sucesso ou erro após o envio.

## Acessibilidade

- Sempre associe labels aos campos de entrada.
- Use atributos ARIA quando necessário.
- Garanta que o formulário possa ser navegado e preenchido apenas com o teclado.
- Mantenha uma ordem de tabulação lógica.

## Exemplo de Implementação Recomendada

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Esquema de validação
const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Por favor, insira um e-mail válido",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function UserForm() {
  const { toast } = useToast();
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  function onSubmit(data: UserFormValues) {
    // Lógica de submissão...
    toast({
      title: "Formulário enviado!",
      description: "Seus dados foram enviados com sucesso.",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}
```

## Migração de Formulários Existentes

Ao atualizar formulários existentes:

1. Identifique o tipo de formulário (simples ou complexo).
2. Escolha o padrão apropriado (ContactForm ou react-hook-form + zod).
3. Migre gradualmente, garantindo que a funcionalidade existente seja mantida.
4. Adicione validação adequada.
5. Teste exaustivamente após a migração.

---

Estas diretrizes devem ser seguidas para todos os novos formulários e, quando possível, aplicadas aos formulários existentes durante refatorações. 