import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Retrieves the current restaurant ID from the URL or session storage
 * @returns The restaurant ID or null if not found
 */
export function getCurrentRestaurant(): string | null {
  // Primeiro tenta obter da URL (formato: /r/restaurante-slug)
  const path = window.location.pathname;
  const match = path.match(/\/r\/([^\/]+)/);
  
  if (match && match[1]) {
    return match[1]; // Retorna o slug do restaurante
  }
  
  // Se não encontrou na URL, tenta obter do armazenamento local
  const storedRestaurant = localStorage.getItem('currentRestaurant');
  if (storedRestaurant) {
    try {
      const restaurantData = JSON.parse(storedRestaurant);
      return restaurantData.id || null;
    } catch (error) {
      console.error('Erro ao parsear dados do restaurante:', error);
    }
  }
  
  return null;
}

/**
 * Validates a Brazilian CPF number (Cadastro de Pessoas Físicas)
 * @param cpf CPF number (with or without formatting)
 * @returns boolean indicating if the CPF is valid
 */
export function validateCPF(cpf: string): boolean {
  // Remove non-numeric characters
  cpf = cpf.replace(/[^\d]/g, '');

  // CPF must have 11 digits
  if (cpf.length !== 11) return false;

  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  let checkDigit1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cpf.charAt(9)) !== checkDigit1) return false;

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  let checkDigit2 = remainder < 2 ? 0 : 11 - remainder;
  return parseInt(cpf.charAt(10)) === checkDigit2;
}

/**
 * Validates a Brazilian CNPJ number (Cadastro Nacional de Pessoa Jurídica)
 * @param cnpj CNPJ number (with or without formatting)
 * @returns boolean indicating if the CNPJ is valid
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove non-numeric characters
  cnpj = cnpj.replace(/[^\d]/g, '');

  // CNPJ must have 14 digits
  if (cnpj.length !== 14) return false;

  // Check if all digits are the same (invalid CNPJ)
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Validate first check digit
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  let checkDigit1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cnpj.charAt(12)) !== checkDigit1) return false;

  // Validate second check digit
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  let checkDigit2 = remainder < 2 ? 0 : 11 - remainder;
  return parseInt(cnpj.charAt(13)) === checkDigit2;
}

/**
 * Formats a value as Brazilian currency (BRL)
 * @param value Value to format
 * @returns Formatted value
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
