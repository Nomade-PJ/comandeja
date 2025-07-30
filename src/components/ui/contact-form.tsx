import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  colSpan?: 1 | 2; // 1 para meia largura, 2 para largura completa
}

export interface ContactFormProps {
  /**
   * Título do formulário
   */
  title?: string;
  
  /**
   * Descrição do formulário
   */
  description?: string;
  
  /**
   * Campos do formulário
   */
  fields: FormField[];
  
  /**
   * Texto do botão de envio
   */
  submitButtonText?: string;
  
  /**
   * Texto exibido após o envio bem-sucedido
   */
  successTitle?: string;
  
  /**
   * Descrição exibida após o envio bem-sucedido
   */
  successDescription?: string;
  
  /**
   * Texto do botão de nova submissão
   */
  resetButtonText?: string;
  
  /**
   * Texto do aviso de privacidade
   */
  privacyText?: string;
  
  /**
   * Função chamada ao enviar o formulário
   * Se não for fornecida, uma simulação de envio será usada
   */
  onSubmit?: (formData: Record<string, string>) => Promise<void>;
  
  /**
   * Classes CSS adicionais
   */
  className?: string;
}

export function ContactForm({
  title,
  description,
  fields,
  submitButtonText = "Enviar",
  successTitle = "Mensagem enviada com sucesso!",
  successDescription = "Nossa equipe entrará em contato em breve.",
  resetButtonText = "Enviar nova mensagem",
  privacyText = "Ao enviar este formulário, você concorda com nossa Política de Privacidade.",
  onSubmit,
  className = "",
}: ContactFormProps) {
  // Estado inicial do formulário
  const initialFormData = fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {} as Record<string, string>);
  
  const [formData, setFormData] = useState<Record<string, string>>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (onSubmit) {
        // Usar a função de envio personalizada
        await onSubmit(formData);
      } else {
        // Simulação de envio de formulário
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setSubmitted(true);
      toast({
        title: successTitle,
        description: successDescription,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar formulário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao enviar o formulário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData(initialFormData);
    setSubmitted(false);
  };
  
  // Renderizar o formulário
  return (
    <div className={className}>
      {title && <h2 className="text-3xl font-bold mb-6">{title}</h2>}
      {description && <p className="text-gray-600 mb-8">{description}</p>}
      
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid para campos de formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => {
              // Determinar se o campo deve ocupar a largura completa
              const isFullWidth = field.colSpan === 2 || field.type === "textarea";
              
              return (
                <div 
                  key={field.name} 
                  className={`space-y-2 ${isFullWidth ? "md:col-span-2" : ""}`}
                >
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && "*"}
                  </Label>
                  
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      name={field.name}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={formData[field.name]}
                      onChange={handleChange}
                      rows={6}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.name}
                      name={field.name}
                      required={field.required}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData[field.name]}
                      onChange={handleChange}
                    >
                      <option value="">Selecione uma opção</option>
                      {field.options?.map((option, i) => (
                        <option key={i} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={formData[field.name]}
                      onChange={handleChange}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white"
            disabled={loading}
          >
            {loading ? "Enviando..." : submitButtonText}
          </Button>
          
          {privacyText && (
            <p className="text-xs text-gray-500 text-center">
              {privacyText}
            </p>
          )}
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{successTitle}</h3>
          <p className="text-gray-600 mb-4">
            {successDescription}
          </p>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={resetForm}
          >
            {resetButtonText}
          </Button>
        </div>
      )}
    </div>
  );
} 