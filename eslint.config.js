import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactPlugin from "eslint-plugin-react";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "react": reactPlugin,
      "import": importPlugin
    },
    settings: {
      react: {
        version: "detect" // Detecta automaticamente a versão do React
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"]
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true // Sempre tenta resolver tipos
        }
      }
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Habilitar verificação de variáveis não utilizadas
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "vars": "all", 
        "args": "after-used",
        "ignoreRestSiblings": true,
        "argsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_"
      }],
      // Verificar importações não utilizadas
      "import/no-unused-modules": ["warn", {
        "unusedExports": true,
      }],
      // Verificar declarações de componentes não utilizados
      "react/jsx-uses-vars": "warn",
      "react/jsx-uses-react": "warn",
      // Verificar funções não utilizadas
      "no-unused-expressions": ["warn", { 
        "allowShortCircuit": true, 
        "allowTernary": true 
      }],
      // Verificar código morto (unreachable)
      "no-unreachable": "warn",
      // Verificar importações duplicadas
      "no-duplicate-imports": "warn",
    },
  }
);
