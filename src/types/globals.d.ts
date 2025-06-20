// Definições globais para tipos que causam problemas de profundidade excessiva

// Definição para evitar errors de "Type instantiation is excessively deep and possibly infinite"
declare namespace TypeFix {
  export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
  };
} 