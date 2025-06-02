import { validateBr } from 'js-brasil';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LoaderCircle, CheckCircle, Clock, MapPin, FileText } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

// Validation schema with three separate schemas for each step
const stepOneSchema = z.object({
  name: z.string().min(2, {
    message: 'Nome deve ter no mínimo 2 caracteres.',
  }),
  restaurantName: z.string().min(2, {
    message: 'Nome do estabelecimento deve ter no mínimo 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Email inválido.',
  }),
  password: z.string().min(6, {
    message: 'Senha deve ter no mínimo 6 caracteres.',
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem.',
  path: ['confirmPassword'],
});

// Atualização do schema da etapa 2 com campos de endereço separados
const stepTwoSchema = z.object({
  documentType: z.enum(['cpf', 'cnpj']),
  documentNumber: z.string()
    .min(1, { message: 'Documento é obrigatório' })
    .refine((val) => {
      if (val.length === 0) return true;
      // Removendo formatação para validação
      const cleanVal = val.replace(/[^\d]/g, '');
      return cleanVal.length > 0;
    }, {
      message: "Número de documento deve conter apenas dígitos"
    }),
  isOnlineEstablishment: z.boolean().default(false),
  street: z.string().min(1, {
    message: 'Rua é obrigatória',
  }).optional().or(z.literal('')),
  number: z.string().optional().or(z.literal('')),
  neighborhood: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  onlineAddress: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  // Se for estabelecimento online, o endereço online é obrigatório
  if (data.isOnlineEstablishment) {
    if (!data.onlineAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o endereço online do estabelecimento",
        path: ['onlineAddress']
      });
    }
  } else {
    // Se for físico, os campos básicos são obrigatórios
    if (!data.street) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe a rua do estabelecimento",
        path: ['street']
      });
    }
    if (!data.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe a cidade do estabelecimento",
        path: ['city']
      });
    }
    if (!data.state) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o estado do estabelecimento",
        path: ['state']
      });
    }
  }
});

const stepThreeSchema = z.object({
  businessHours: z.array(
    z.object({
      dayOfWeek: z.number(),
      name: z.string(),
      isOpen: z.boolean().default(false),
      openTime: z.string().nullable().optional(),
      closeTime: z.string().nullable().optional(),
    })
  ),
});

// Define type for the complete form
type FormSchema = z.infer<typeof stepOneSchema> & 
                  z.infer<typeof stepTwoSchema> & 
                  z.infer<typeof stepThreeSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [slug, setSlug] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [documentIsValid, setDocumentIsValid] = useState(false);
  
  // Obter o plano selecionado do estado de navegação
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<{ name: string, discount: number } | null>(null);
  const [fromCheckout, setFromCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  // Initialize business hours for step 3
  const [businessHours, setBusinessHours] = useState([
    { dayOfWeek: 0, name: 'Domingo', isOpen: false, openTime: '08:00', closeTime: '18:00' },
    { dayOfWeek: 1, name: 'Segunda', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { dayOfWeek: 2, name: 'Terça', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { dayOfWeek: 3, name: 'Quarta', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { dayOfWeek: 4, name: 'Quinta', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { dayOfWeek: 5, name: 'Sexta', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { dayOfWeek: 6, name: 'Sábado', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  ]);

  useEffect(() => {
    // Verificar se há um plano selecionado no estado
    const state = location.state as { 
      selectedPlan?: string, 
      fromCheckout?: boolean,
      paymentMethod?: string 
    } | null;
    
    if (state && state.selectedPlan) {
      setSelectedPlan(state.selectedPlan);
      
      // Verificar se o usuário veio da página de checkout
      if (state.fromCheckout) {
        setFromCheckout(true);
      }
      
      // Guardar o método de pagamento selecionado, se existir
      if (state.paymentMethod) {
        setPaymentMethod(state.paymentMethod);
      }
      
      // Definir detalhes do plano com base no ID
      const planInfo = {
        'monthly': { name: 'Mensal', discount: 0 },
        'six-months': { name: 'Semestral', discount: 15 },
        'yearly': { name: 'Anual', discount: 25 }
      };
      
      setPlanDetails(planInfo[state.selectedPlan as keyof typeof planInfo] || null);
    }
  }, [location.state]);

  // Select the appropriate schema based on the current step
  const getCurrentSchema = () => {
    switch (currentStep) {
      case 1:
        return stepOneSchema;
      case 2:
        return stepTwoSchema;
      case 3:
        return stepThreeSchema;
      default:
        return stepOneSchema;
    }
  };

  const form = useForm<FormSchema>({
    resolver: zodResolver(getCurrentSchema()),
    defaultValues: {
      name: '',
      restaurantName: '',
      email: '',
      password: '',
      confirmPassword: '',
      documentType: 'cpf' as const,
      documentNumber: '',
      isOnlineEstablishment: false,
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      onlineAddress: '',
      businessHours: businessHours,
    },
  });

  // Validação de CPF/CNPJ
  const validateDocument = (document: string, type: 'cpf' | 'cnpj') => {
    // Removendo formatação para validação
    const cleanDocument = document.replace(/[^\d]/g, '');
    let isValid = false;
    
    try {
      if (type === 'cpf') {
        isValid = validateBr.cpf(cleanDocument);
      } else {
        isValid = validateBr.cnpj(cleanDocument);
      }
    } catch (error) {
      isValid = false;
    }
    
    setDocumentIsValid(isValid);
    return isValid;
  };

  // Effect para validar documento quando o tipo ou número mudar
  useEffect(() => {
    const documentType = form.watch('documentType');
    const documentNumber = form.watch('documentNumber');
    
    if (documentNumber && documentNumber.length > 0) {
      validateDocument(documentNumber, documentType);
    } else {
      setDocumentIsValid(false);
    }
  }, [form.watch('documentType'), form.watch('documentNumber')]);

  // Gera o slug baseado no nome do restaurante
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Atualiza o slug quando o nome do restaurante é alterado
  const handleRestaurantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('restaurantName', value);
    setSlug(generateSlug(value));
  };

  const handleBusinessHourChange = (index: number, field: string, value: any) => {
    const updatedHours = [...businessHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setBusinessHours(updatedHours);
    form.setValue('businessHours', updatedHours);
  };

  // Formatação de CPF e CNPJ conforme digitação
  const formatDocument = (value: string, type: 'cpf' | 'cnpj') => {
    // Remove caracteres não numéricos
    const digits = value.replace(/\D/g, '');
    
    if (type === 'cpf') {
      // Formatação de CPF: 000.000.000-00
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
      // Formatação de CNPJ: 00.000.000/0000-00
      return digits
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const documentType = form.getValues('documentType');
    const formattedValue = formatDocument(value, documentType);
    form.setValue('documentNumber', formattedValue);
  };

  // Função para buscar endereço a partir do CEP usando a Edge Function do Supabase
  const handleCepSearch = async (cep: string) => {
    // Limpar qualquer formato que não seja número
    const cleanCep = cep.replace(/\D/g, '');
    
    // Verificar se o CEP tem 8 dígitos
    if (cleanCep.length !== 8) return;
    
    try {
      // Indicar carregamento
      form.setValue('postalCode', cep);
      
      toast({
        title: "Buscando CEP",
        description: "Aguarde enquanto consultamos o endereço...",
      });
      
      // Chamar a Edge Function do Supabase para buscar o CEP
      // Incluindo a chave anônima do Supabase no cabeçalho para autorização
      const response = await fetch(
        `https://rcintgdnamflzbbqeqjb.supabase.co/functions/v1/buscar-cep?cep=${cleanCep}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjaW50Z2RuYW1mbHpiYnFlcWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MTE1MDAsImV4cCI6MjA2MzI4NzUwMH0.MWsjVopzzIwvXMeVOfEKec_1r0zwuFfliUCH38CZKEY'
          }
        }
      );
      
      // Se a resposta não for bem-sucedida, lançar um erro
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro na requisição:', response.status, errorData);
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Resposta da busca de CEP:', data);
      
      // Verificar se a resposta não contém erro
      if (data && !data.error && !data.erro) {
        // Preencher os campos com os dados retornados
        form.setValue('street', data.logradouro || '');
        form.setValue('neighborhood', data.bairro || '');
        form.setValue('city', data.localidade || '');
        form.setValue('state', data.uf || '');
        
        // Focar no campo número após preencher os outros campos
        setTimeout(() => {
          const numberInput = document.querySelector('input[name="number"]') as HTMLInputElement;
          if (numberInput) numberInput.focus();
        }, 100);
        
        toast({
          title: "CEP encontrado",
          description: "Endereço preenchido automaticamente",
        });
      } else {
        console.error('Erro na resposta da API:', data.error || data.erro || 'Erro desconhecido');
        
        // Tentar obter o CEP diretamente do ViaCEP sem usar a Edge Function
        try {
          // Criar uma função para buscar CEP diretamente
          const fetchCepDirectly = async () => {
            // Usar a BrasilAPI que não tem problemas de CORS
            const brasilApiResponse = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
            if (!brasilApiResponse.ok) {
              throw new Error('Erro ao buscar CEP na BrasilAPI');
            }
            const brasilData = await brasilApiResponse.json();
            
            // Converter formato da BrasilAPI para o formato do ViaCEP
            return {
              logradouro: brasilData.street,
              bairro: brasilData.neighborhood,
              localidade: brasilData.city,
              uf: brasilData.state,
              cep: brasilData.cep
            };
          };
          
          const cepData = await fetchCepDirectly();
          
          // Preencher os campos com os dados da API direta
          form.setValue('street', cepData.logradouro || '');
          form.setValue('neighborhood', cepData.bairro || '');
          form.setValue('city', cepData.localidade || '');
          form.setValue('state', cepData.uf || '');
          
          // Focar no campo número após preencher os outros campos
          setTimeout(() => {
            const numberInput = document.querySelector('input[name="number"]') as HTMLInputElement;
            if (numberInput) numberInput.focus();
          }, 100);
          
          toast({
            title: "CEP encontrado",
            description: "Endereço preenchido automaticamente",
          });
          return;
        } catch (directError) {
          console.error('Erro ao tentar buscar CEP diretamente:', directError);
          
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP informado",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      
      // Tentar obter o CEP diretamente como fallback
      try {
        // Usar a BrasilAPI que não tem problemas de CORS
        const brasilApiResponse = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
        if (!brasilApiResponse.ok) {
          throw new Error('Erro ao buscar CEP na BrasilAPI');
        }
        const brasilData = await brasilApiResponse.json();
        
        // Preencher os campos com os dados da BrasilAPI
        form.setValue('street', brasilData.street || '');
        form.setValue('neighborhood', brasilData.neighborhood || '');
        form.setValue('city', brasilData.city || '');
        form.setValue('state', brasilData.state || '');
        
        // Focar no campo número após preencher os outros campos
        setTimeout(() => {
          const numberInput = document.querySelector('input[name="number"]') as HTMLInputElement;
          if (numberInput) numberInput.focus();
        }, 100);
        
        toast({
          title: "CEP encontrado",
          description: "Endereço preenchido automaticamente",
        });
        return;
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        
        toast({
          title: "Erro na busca",
          description: "Não foi possível consultar o endereço",
          variant: "destructive",
        });
      }
    }
  };

  // Manipulador para o campo de CEP
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Formatar o CEP (00000-000)
    const formattedCep = value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
    
    form.setValue('postalCode', formattedCep);
    
    // Se o CEP tiver 8 dígitos (sem contar o hífen), buscar o endereço
    if (formattedCep.replace(/\D/g, '').length === 8) {
      handleCepSearch(formattedCep);
    }
  };

  // Handle next step transition
  const handleNextStep = async () => {
    // Validate current step
    let isValid = false;
    
    if (currentStep === 1) {
      const result = await form.trigger(['name', 'restaurantName', 'email', 'password', 'confirmPassword']);
      isValid = result;
    } else if (currentStep === 2) {
      const result = await form.trigger([
        'documentType', 
        'documentNumber', 
        'isOnlineEstablishment',
        'street',
        'number',
        'neighborhood',
        'city',
        'state',
        'postalCode',
        'onlineAddress'
      ]);

      // Verificar se o documento é válido
      const documentType = form.getValues('documentType');
      const documentNumber = form.getValues('documentNumber');
      const documentValid = validateDocument(documentNumber, documentType);

      if (!documentValid) {
        form.setError('documentNumber', { 
          type: 'manual',
          message: documentType === 'cpf' ? 'CPF inválido' : 'CNPJ inválido' 
        });
        isValid = false;
      } else {
        isValid = result;
      }
    }

    if (isValid) {
      // Antes de avançar para a etapa 2, certifique-se de que o campo documentNumber esteja vazio
      if (currentStep === 1) {
        form.setValue('documentNumber', '');
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const onSubmit = async (values: FormSchema) => {
    // Verificar se estamos na última etapa e se o botão "Criar conta" foi clicado
    // Quando é um evento de "Próximo", não devemos processar como um envio de formulário
    if (currentStep !== 3) {
      console.log('Tentativa de submissão fora da etapa 3, ignorando...');
      handleNextStep();
      return;
    }
    
    console.log('Processando submissão na etapa 3');
    
    // Obter todos os valores do formulário para garantir que temos os dados completos
    const formData = form.getValues();
    
    // Combinar os campos de endereço para compatibilidade com o backend atual
    let fullAddress = '';
    if (formData.isOnlineEstablishment) {
      fullAddress = formData.onlineAddress || 'Estabelecimento online';
    } else {
      fullAddress = `${formData.street || ''}, ${formData.number || ''}, ${formData.neighborhood || ''}, ${formData.city || ''}, ${formData.state || ''}, ${formData.postalCode || ''}`.replace(/,\s*,/g, ',').replace(/,\s*$/g, '');
    }
    
    console.log('📝 Iniciando processo de registro:', { 
      name: formData.name, 
      email: formData.email, 
      restaurantName: formData.restaurantName,
      documentType: formData.documentType,
      documentNumber: formData.documentNumber,
      address: fullAddress,
      isOnlineEstablishment: formData.isOnlineEstablishment,
      businessHours: formData.businessHours,
    });
    
    try {
      // Verificar se temos todos os dados necessários
      if (!formData.name || !formData.email || !formData.password || !formData.restaurantName) {
        toast({
          title: "Dados incompletos",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        });
        setCurrentStep(1); // Voltar para a primeira etapa
        return;
      }
      
      const success = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.restaurantName
      );

      if (success) {
        console.log('✅ Registro realizado com sucesso');
        
        // Save additional information to be used after registration
        sessionStorage.setItem('is_new_registration', 'true');
        sessionStorage.setItem('registration_document_type', formData.documentType);
        sessionStorage.setItem('registration_document_number', formData.documentNumber);
        sessionStorage.setItem('registration_address', fullAddress);
        sessionStorage.setItem('registration_is_online', formData.isOnlineEstablishment ? 'true' : 'false');
        
        // Armazenar campos de endereço separados
        if (!formData.isOnlineEstablishment) {
          sessionStorage.setItem('registration_street', formData.street || '');
          sessionStorage.setItem('registration_number', formData.number || '');
          sessionStorage.setItem('registration_neighborhood', formData.neighborhood || '');
          sessionStorage.setItem('registration_city', formData.city || '');
          sessionStorage.setItem('registration_state', formData.state || '');
          sessionStorage.setItem('registration_postal_code', formData.postalCode || '');
        } else {
          sessionStorage.setItem('registration_online_address', formData.onlineAddress || '');
        }
        
        sessionStorage.setItem('registration_business_hours', JSON.stringify(formData.businessHours));
        
        // Verificar se deve forçar o redirecionamento para o dashboard
        const redirectToDashboard = sessionStorage.getItem('redirect_to_dashboard') === 'true';
        
        // Salvar informações do plano para uso posterior, se necessário
        if (fromCheckout && selectedPlan && !redirectToDashboard) {
          // Persistir o método de pagamento e plano selecionado para uso posterior
          sessionStorage.setItem('selected_plan', selectedPlan);
          if (paymentMethod) {
            sessionStorage.setItem('selected_payment_method', paymentMethod);
          }
          
          toast({
            title: "Registro concluído",
            description: "Sua conta foi criada com sucesso! Complete as informações do seu estabelecimento.",
          });
          
          // Redirecionar para o checkout
          navigate('/checkout', { state: { selectedPlan } });
        } else {
          // Limpar flag de redirecionamento se existir
          sessionStorage.removeItem('redirect_to_dashboard');
          
          toast({
            title: "Registro concluído",
            description: "Sua conta foi criada com sucesso!",
          });
          
          // Redirecionar para o dashboard
          console.log('✅ Redirecionando para o dashboard');
          navigate('/dashboard');
        }
      } else {
        console.log('❌ Falha no registro');
        // Mensagem de erro já exibida pelo AuthContext
      }
    } catch (error) {
      console.error('❌ Erro durante o registro:', error);
      toast({
        title: "Erro no registro",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Dados Iniciais";
      case 2:
        return "Documento e Endereço";
      case 3:
        return "Horário de Funcionamento";
      default:
        return "Cadastro";
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1:
        return <FileText className="h-5 w-5 mr-2" />;
      case 2:
        return <MapPin className="h-5 w-5 mr-2" />;
      case 3:
        return <Clock className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  // Step indicators
  const renderStepIndicators = () => {
    return (
      <div className="flex justify-between mb-6 px-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step === currentStep 
                  ? 'bg-primary text-white' 
                  : step < currentStep 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-gray-200 text-gray-400'
              }`}
            >
              {step}
                </div>
            <div className={`text-xs mt-1 ${
              step === currentStep ? 'text-primary font-medium' : 'text-gray-400'
            }`}>
              {step === 1 ? 'Dados' : step === 2 ? 'Documento' : 'Horários'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Limpar o campo de documento quando mudar para a etapa 2
  useEffect(() => {
    if (currentStep === 2) {
      // Definir um timeout para garantir que a limpeza ocorra após qualquer preenchimento automático
      setTimeout(() => {
        form.setValue('documentNumber', '');
      }, 50);
    }
  }, [currentStep, form]);

  // Render the form based on the current step
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Seu nome" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="restaurantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do estabelecimento</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Nome do seu restaurante"
                        onChange={handleRestaurantNameChange} 
                      autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {slug && (
                <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                  Seu estabelecimento estará disponível em:
                  <div className="font-medium mt-1">comandeja.com/{slug}</div>
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="seu@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </>
        );
      case 2:
        return (
          <>
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de documento</FormLabel>
                  <div className="flex flex-row space-x-3">
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="cpf" 
                          checked={field.value === 'cpf'} 
                          onChange={() => form.setValue('documentType', 'cpf')}
                          className="h-4 w-4 accent-primary"
                        />
                        <label htmlFor="cpf" className="text-sm">CPF</label>
                      </div>
                    </FormControl>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="cnpj"
                          checked={field.value === 'cnpj'} 
                          onChange={() => form.setValue('documentType', 'cnpj')}
                          className="h-4 w-4 accent-primary"
                        />
                        <label htmlFor="cnpj" className="text-sm">CNPJ</label>
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch('documentType') === 'cpf' ? 'CPF' : 'CNPJ'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      key="documentNumberInput" // Forçar re-renderização do input
                      placeholder={
                        form.watch('documentType') === 'cpf'
                          ? '000.000.000-00'
                          : '00.000.000/0000-00'
                      }
                      onChange={handleDocumentChange}
                      className={documentIsValid ? "border-green-500" : ""}
                      autoComplete="off" // Desativar preenchimento automático
                      onFocus={(e) => {
                        // Garantir que o valor esteja limpo ao focar
                        if (e.target.value === form.getValues('restaurantName')) {
                          form.setValue('documentNumber', '');
                        }
                      }}
                    />
                  </FormControl>
                  {documentIsValid && (
                    <div className="text-xs text-green-600 flex items-center mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Documento válido
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isOnlineEstablishment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Estabelecimento online
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Marque esta opção se você não possui um estabelecimento físico
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {form.watch('isOnlineEstablishment') ? (
              <FormField
                control={form.control}
                name="onlineAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço online</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Site, Instagram, WhatsApp ou outra referência online"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="00000-000"
                            onChange={handlePostalCodeChange}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Digite o CEP para preencher o endereço automaticamente
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Rua/Avenida</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Nome da rua ou avenida"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Número"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Bairro"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Cidade"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Estado"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Defina os horários de funcionamento do seu estabelecimento:
            </div>
            {businessHours.map((day, index) => (
              <div key={index} className="border rounded-md p-3 mb-2">
                <div className="flex items-center">
                  <Checkbox
                    checked={day.isOpen}
                    onCheckedChange={(checked) => {
                      handleBusinessHourChange(index, 'isOpen', !!checked);
                    }}
                    className="mr-2"
                  />
                  <div className="font-medium">{day.name}</div>
                </div>
                {day.isOpen && (
                  <div className="flex items-center mt-2 space-x-2">
                    <div className="text-sm">Das:</div>
                    <Input
                      type="time"
                      value={day.openTime}
                      onChange={(e) => handleBusinessHourChange(index, 'openTime', e.target.value)}
                      className="w-24"
                    />
                    <div className="text-sm">até:</div>
                    <Input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => handleBusinessHourChange(index, 'closeTime', e.target.value)}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-0">
      <div className="w-full max-w-md">
        <div className="text-center -mb-4">
          <img src="/images/logo.png" alt="ComandeJá" className="h-52 mx-auto -mb-4" />
        </div>

        <div className="bg-card border rounded-lg shadow-sm p-4 mt-0">
          <div className="flex items-center mb-2">
            {getStepIcon()}
            <h2 className="text-xl font-semibold">Cadastro - {getStepTitle()}</h2>
          </div>
          
          {renderStepIndicators()}
          
          {selectedPlan && planDetails && (
            <div className="bg-purple-50 border border-purple-200 rounded-md p-3 mb-4 flex items-start">
              <CheckCircle className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-purple-800">
                  Plano {planDetails.name} selecionado
                  {planDetails.discount > 0 && (
                    <Badge className="ml-2 bg-green-500">-{planDetails.discount}%</Badge>
                  )}
                </div>
                <p className="text-sm text-purple-700">
                  {selectedPlan === 'monthly' 
                    ? 'Cobrado mensalmente' 
                    : selectedPlan === 'six-months'
                      ? 'Cobrança semestral com 15% de desconto'
                      : 'Cobrança anual com 25% de desconto'}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Você poderá alterar seu plano depois no painel administrativo
                </p>
              </div>
            </div>
          )}

          <Form {...form}>
            {/* Usar função específica para submissão apenas quando for realmente para criar a conta (etapa 3) */}
            {currentStep === 3 ? (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {renderFormStep()}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={handlePrevStep}>
                    Voltar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isLoading}
                  >
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta'
                )}
              </Button>
                </div>
            </form>
            ) : (
              <div className="space-y-4">
                {renderFormStep()}
                {currentStep === 1 ? (
                  <Button type="button" className="w-full" onClick={handleNextStep}>
                    Próximo
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={handlePrevStep}>
                      Voltar
                    </Button>
                    <Button type="button" className="flex-1" onClick={handleNextStep}>
                      Próximo
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Form>

          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
