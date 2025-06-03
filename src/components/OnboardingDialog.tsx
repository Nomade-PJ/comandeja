import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { validateCPF, validateCNPJ } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

// CSS para esconder o botão de fechar do diálogo
const hideCloseButtonStyles = `
  .onboarding-dialog [data-radix-dialog-close] {
    display: none !important;
  }
`;

// Schema for business information
const businessInfoSchema = z.object({
  documentType: z.enum(['cpf', 'cnpj']),
  documentNumber: z.string().min(1, "Documento é obrigatório"),
  restaurantName: z.string().min(2, {
    message: 'Nome do estabelecimento deve ter no mínimo 2 caracteres.',
  }),
  address: z.string().min(5, {
    message: 'Endereço deve ter no mínimo 5 caracteres.',
  }),
  city: z.string().min(2, {
    message: 'Cidade é obrigatória.',
  }),
  state: z.string().min(2, {
    message: 'Estado é obrigatório.',
  }),
  zipCode: z.string().min(8, {
    message: 'CEP é obrigatório.',
  })
}).refine((data) => {
  // Validate document based on type
  return data.documentType === 'cpf' 
    ? validateCPF(data.documentNumber) 
    : validateCNPJ(data.documentNumber);
}, {
  message: "Documento inválido. Verifique os números.",
  path: ["documentNumber"], // Show the error on the documentNumber field
});

// Schema for business hours
const businessHoursSchema = z.object({
  mondayOpen: z.boolean(),
  mondayStart: z.string().optional(),
  mondayEnd: z.string().optional(),
  
  tuesdayOpen: z.boolean(),
  tuesdayStart: z.string().optional(),
  tuesdayEnd: z.string().optional(),
  
  wednesdayOpen: z.boolean(),
  wednesdayStart: z.string().optional(),
  wednesdayEnd: z.string().optional(),
  
  thursdayOpen: z.boolean(),
  thursdayStart: z.string().optional(),
  thursdayEnd: z.string().optional(),
  
  fridayOpen: z.boolean(),
  fridayStart: z.string().optional(),
  fridayEnd: z.string().optional(),
  
  saturdayOpen: z.boolean(),
  saturdayStart: z.string().optional(),
  saturdayEnd: z.string().optional(),
  
  sundayOpen: z.boolean(),
  sundayStart: z.string().optional(),
  sundayEnd: z.string().optional(),
});

interface OnboardingDialogProps {
  open: boolean;
  restaurantName?: string; // Optional prop if name is already available
  onClose?: () => void; // Mantido para compatibilidade, mas não será usado
}

const OnboardingDialog: React.FC<OnboardingDialogProps> = ({ open, restaurantName = '' }) => {
  const [step, setStep] = useState<'businessInfo' | 'businessHours'>('businessInfo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { restaurant, updateRestaurantInfo, updateRestaurantSettings } = useRestaurant();
  
  // Form for business information
  const businessInfoForm = useForm<z.infer<typeof businessInfoSchema>>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      documentType: 'cpf',
      documentNumber: '',
      restaurantName: restaurantName || '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  
  // Effect to load registration data from sessionStorage
  useEffect(() => {
    const loadRegistrationData = () => {
      // Check if we have registration data from the register process
      const documentType = sessionStorage.getItem('registration_document_type') as 'cpf' | 'cnpj' || 'cpf';
      const documentNumber = sessionStorage.getItem('registration_document_number') || '';
      const address = sessionStorage.getItem('registration_address') || '';
      const isOnline = sessionStorage.getItem('registration_is_online') === 'true';
      
      // Set document type
      setDocumentType(documentType);
      businessInfoForm.setValue('documentType', documentType);
      
      // Set document number if available
      if (documentNumber) {
        businessInfoForm.setValue('documentNumber', documentNumber);
      }
      
      // Set address or individual fields
      if (isOnline) {
        const onlineAddress = sessionStorage.getItem('registration_online_address') || '';
        businessInfoForm.setValue('address', onlineAddress || 'Estabelecimento online');
      } else {
        // If we have specific address fields, use them
        const street = sessionStorage.getItem('registration_street') || '';
        const number = sessionStorage.getItem('registration_number') || '';
        const neighborhood = sessionStorage.getItem('registration_neighborhood') || '';
        const city = sessionStorage.getItem('registration_city') || '';
        const state = sessionStorage.getItem('registration_state') || '';
        const postalCode = sessionStorage.getItem('registration_postal_code') || '';
        
        // Format complete address if individual fields are available
        if (street && city) {
          const formattedAddress = `${street}${number ? `, ${number}` : ''}${neighborhood ? `, ${neighborhood}` : ''}, ${city}${state ? ` - ${state}` : ''}`;
          businessInfoForm.setValue('address', formattedAddress);
        } else if (address) {
          // Otherwise use the complete address if available
          businessInfoForm.setValue('address', address);
        }
        
        // Set city and state
        businessInfoForm.setValue('city', city);
        businessInfoForm.setValue('state', state);
        businessInfoForm.setValue('zipCode', postalCode);
      }
      
      // Clear sessionStorage to avoid reusing the data inappropriately
      // We'll keep it in case the user needs to go through the process again
      // sessionStorage.removeItem('registration_document_type');
      // sessionStorage.removeItem('registration_document_number');
      // sessionStorage.removeItem('registration_address');
      // sessionStorage.removeItem('registration_is_online');
      // sessionStorage.removeItem('registration_street');
      // sessionStorage.removeItem('registration_number');
      // sessionStorage.removeItem('registration_neighborhood');
      // sessionStorage.removeItem('registration_city');
      // sessionStorage.removeItem('registration_state');
      // sessionStorage.removeItem('registration_postal_code');
      // sessionStorage.removeItem('registration_online_address');
      // sessionStorage.removeItem('registration_business_hours');
    };
    
    loadRegistrationData();
  }, []);
  
  // Form for business hours
  const businessHoursForm = useForm<z.infer<typeof businessHoursSchema>>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: {
      mondayOpen: true,
      mondayStart: '08:00',
      mondayEnd: '18:00',
      
      tuesdayOpen: true,
      tuesdayStart: '08:00',
      tuesdayEnd: '18:00',
      
      wednesdayOpen: true,
      wednesdayStart: '08:00',
      wednesdayEnd: '18:00',
      
      thursdayOpen: true,
      thursdayStart: '08:00',
      thursdayEnd: '18:00',
      
      fridayOpen: true,
      fridayStart: '08:00',
      fridayEnd: '18:00',
      
      saturdayOpen: true,
      saturdayStart: '08:00',
      saturdayEnd: '18:00',
      
      sundayOpen: false,
      sundayStart: '08:00',
      sundayEnd: '18:00',
    }
  });
  
  // Handle document type change
  const handleDocumentTypeChange = (type: 'cpf' | 'cnpj') => {
    setDocumentType(type);
    businessInfoForm.setValue('documentType', type);
    businessInfoForm.setValue('documentNumber', ''); // Clear the field when changing type
  };
  
  // Format document field based on type
  const formatDocument = (value: string): string => {
    if (!value) return value;
    
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    if (documentType === 'cpf') {
      // Format as CPF: 000.000.000-00
      if (numericValue.length <= 3) {
        return numericValue;
      } else if (numericValue.length <= 6) {
        return `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
      } else if (numericValue.length <= 9) {
        return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
      } else {
        return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9, 11)}`;
      }
    } else {
      // Format as CNPJ: 00.000.000/0000-00
      if (numericValue.length <= 2) {
        return numericValue;
      } else if (numericValue.length <= 5) {
        return `${numericValue.slice(0, 2)}.${numericValue.slice(2)}`;
      } else if (numericValue.length <= 8) {
        return `${numericValue.slice(0, 2)}.${numericValue.slice(2, 5)}.${numericValue.slice(5)}`;
      } else if (numericValue.length <= 12) {
        return `${numericValue.slice(0, 2)}.${numericValue.slice(2, 5)}.${numericValue.slice(5, 8)}/${numericValue.slice(8)}`;
      } else {
        return `${numericValue.slice(0, 2)}.${numericValue.slice(2, 5)}.${numericValue.slice(5, 8)}/${numericValue.slice(8, 12)}-${numericValue.slice(12, 14)}`;
      }
    }
  };

  // Handle business info submission
  const onBusinessInfoSubmit = async (values: z.infer<typeof businessInfoSchema>) => {
    // Move to the next step
    setStep('businessHours');
    
    // Save business info to restaurant
    if (restaurant?.id) {
      try {
        await updateRestaurantInfo({
          name: values.restaurantName,
          address: `${values.address}, ${values.city}, ${values.state}, ${values.zipCode}`,
          // Store the document info as additional metadata (this could be stored in another table in a real app)
          description: JSON.stringify({
            documentType: values.documentType,
            documentNumber: values.documentNumber
          })
        });
      } catch (error) {
        console.error('Erro ao salvar informações do negócio:', error);
      }
    }
  };

  // Handle business hours submission
  const onBusinessHoursSubmit = async (values: z.infer<typeof businessHoursSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Format opening hours
      const openingHours = {
        monday: values.mondayOpen ? `${values.mondayStart}-${values.mondayEnd}` : 'Fechado',
        tuesday: values.tuesdayOpen ? `${values.tuesdayStart}-${values.tuesdayEnd}` : 'Fechado',
        wednesday: values.wednesdayOpen ? `${values.wednesdayStart}-${values.wednesdayEnd}` : 'Fechado',
        thursday: values.thursdayOpen ? `${values.thursdayStart}-${values.thursdayEnd}` : 'Fechado',
        friday: values.fridayOpen ? `${values.fridayStart}-${values.fridayEnd}` : 'Fechado',
        saturday: values.saturdayOpen ? `${values.saturdayStart}-${values.saturdayEnd}` : 'Fechado',
        sunday: values.sundayOpen ? `${values.sundayStart}-${values.sundayEnd}` : 'Fechado'
      };
      
      // Save opening hours to restaurant
      if (restaurant?.id) {
        await updateRestaurantInfo({
          opening_hours: JSON.stringify(openingHours)
        });
      }
      
      toast({
        title: "Configuração concluída!",
        description: "Seu estabelecimento está pronto para usar o ComandeJá.",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar horários de funcionamento:', error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Ocorreu um erro ao salvar os horários. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{hideCloseButtonStyles}</style>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[550px] onboarding-dialog">
          <DialogHeader>
            <DialogTitle>
              {step === 'businessInfo' 
                ? 'Informações do seu estabelecimento' 
                : 'Horários de funcionamento'}
            </DialogTitle>
            <DialogDescription>
              {step === 'businessInfo'
                ? 'Preencha os dados do seu negócio para personalizar sua experiência.'
                : 'Configure os horários de funcionamento do seu estabelecimento.'}
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="bg-amber-50 border-amber-200 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              É obrigatório completar este cadastro para acessar o sistema. Contas não configuradas serão automaticamente excluídas após 72 horas.
            </AlertDescription>
          </Alert>

          {step === 'businessInfo' ? (
            <Form {...businessInfoForm}>
              <form onSubmit={businessInfoForm.handleSubmit(onBusinessInfoSubmit)} className="space-y-4 pt-2">
                <div className="flex gap-4 mb-4">
                  <Button
                    type="button"
                    variant={documentType === 'cpf' ? 'default' : 'outline'}
                    onClick={() => handleDocumentTypeChange('cpf')}
                  >
                    CPF
                  </Button>
                  <Button
                    type="button"
                    variant={documentType === 'cnpj' ? 'default' : 'outline'}
                    onClick={() => handleDocumentTypeChange('cnpj')}
                  >
                    CNPJ
                  </Button>
                </div>
                
                <FormField
                  control={businessInfoForm.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{documentType === 'cpf' ? 'CPF' : 'CNPJ'}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                          onChange={(e) => {
                            const formatted = formatDocument(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={documentType === 'cpf' ? 14 : 18}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={businessInfoForm.control}
                  name="restaurantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do estabelecimento</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do seu restaurante" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={businessInfoForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Rua, número, bairro" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={businessInfoForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Cidade" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={businessInfoForm.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Estado" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={businessInfoForm.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="00000-000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit">
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...businessHoursForm}>
              <form onSubmit={businessHoursForm.handleSubmit(onBusinessHoursSubmit)} className="space-y-6 pt-2">
                {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, index) => {
                  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                  const dayKey = days[index];
                  
                  return (
                    <div key={day} className="flex items-center space-x-4">
                      <FormField
                        control={businessHoursForm.control}
                        name={`${dayKey}Open` as any}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="w-20">{day}</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      {businessHoursForm.watch(`${dayKey}Open` as any) && (
                        <>
                          <FormField
                            control={businessHoursForm.control}
                            name={`${dayKey}Start` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="time"
                                    className="w-28"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <span>até</span>
                          <FormField
                            control={businessHoursForm.control}
                            name={`${dayKey}End` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="time"
                                    className="w-28"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
                
                <div className="pt-4 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep('businessInfo')}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finalizando...
                      </>
                    ) : (
                      'Entrar no sistema'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnboardingDialog; 