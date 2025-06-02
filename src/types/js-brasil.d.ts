declare module 'js-brasil' {
  export interface ValidateBr {
    cpf: (value: string) => boolean;
    cnpj: (value: string) => boolean;
  }

  export const validateBr: ValidateBr;

  // Add other exports from js-brasil as needed
} 