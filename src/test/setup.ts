import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { TextDecoder, TextEncoder } from 'util';

// Polyfill para TextEncoder e TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: (_index: number) => '',
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock do ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserverMock;

// Mock do IntersectionObserver
class IntersectionObserverMock {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];
  
  constructor(private callback: IntersectionObserverCallback) {}
  
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
  
  // Método para simular interseções nos testes
  simulateIntersection(entries: IntersectionObserverEntry[]) {
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

window.IntersectionObserver = IntersectionObserverMock as any;

// Suprimir erros de console durante os testes
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('React does not recognize the') ||
     args[0].includes('Warning:') ||
     args[0].includes('act(...)'))
  ) {
    return;
  }
  originalConsoleError(...args);
}; 