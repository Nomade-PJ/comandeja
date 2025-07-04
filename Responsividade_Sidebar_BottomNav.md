
# 🧭 Responsividade: Sidebar (Desktop) + Bottom Navigation Bar (Mobile)

## 🎯 Objetivo

Implementar uma interface responsiva no sistema, onde:

- Em **telas grandes (Desktop)**: manter a **Sidebar lateral** com todos os menus visíveis.
- Em **telas pequenas (Mobile)**: exibir uma **Bottom Navigation Bar** com os botões principais e um botão “+” que abre um **modal** com mais opções.

---

## 🖥️ Comportamento no Desktop

- A **Sidebar** continuará fixa à esquerda.
- Visível apenas em resoluções `md:` ou superiores.
- Código exemplo:

```tsx
<div className="hidden md:block w-64 bg-white shadow-md">
  {/* Sidebar completa com todos os itens do menu */}
</div>
```

---

## 📱 Comportamento no Mobile

### ✅ Bottom Navigation Bar

- Fixa na parte inferior da tela.
- Contém 5 botões:
  1. Visão Geral
  2. Pedidos
  3. Produtos
  4. Clientes
  5. Botão “+” (abre modal)

```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around items-center h-16 md:hidden z-50">
  <BotaoBottomNav icon={<HomeIcon />} label="Visão" />
  <BotaoBottomNav icon={<ClipboardListIcon />} label="Pedidos" />
  <BotaoBottomNav icon={<BoxIcon />} label="Produtos" />
  <BotaoBottomNav icon={<UsersIcon />} label="Clientes" />
  <BotaoBottomNav icon={<PlusIcon />} onClick={abrirModal} />
</div>
```

---

### 📤 Modal ao Clicar no Botão “+”

- Exibe as opções extras:
  - Relatórios
  - Avaliações
  - Configurações
  - Botão “Sair” ao final

```tsx
<Modal isOpen={isModalAberto} onClose={fecharModal}>
  <h2 className="text-xl font-semibold mb-4">Mais opções</h2>
  <ul className="space-y-2">
    <li><BotaoModal icon={<FileTextIcon />} label="Relatórios" /></li>
    <li><BotaoModal icon={<StarIcon />} label="Avaliações" /></li>
    <li><BotaoModal icon={<SettingsIcon />} label="Configurações" /></li>
  </ul>
  <button className="mt-6 text-red-600 font-bold" onClick={logout}>Sair</button>
</Modal>
```

---

## 🛠 Tecnologias Recomendadas

- **React** + **Tailwind CSS**
- **Ícones**: Heroicons, Lucide ou Feather Icons
- **Modal**: Headless UI, Radix UI ou framer-motion
- **Responsividade**: Utilizar `md:hidden` e `md:block` para controle visual por breakpoint

---

## 📐 Resultado Esperado

| Tipo de Dispositivo | Comportamento Esperado                                           |
|---------------------|------------------------------------------------------------------|
| **Desktop (≥ md)**  | Sidebar lateral visível com todos os itens                      |
| **Mobile (< md)**   | Bottom Navigation com 4 atalhos + botão “+” para abrir modal     |
| **Modal (Mobile)**  | Mostra opções adicionais e botão "Sair"                         |

---

## 💡 Dica Extra

- Para bloquear o scroll ao abrir o modal, use `overflow-hidden` no `body`.
- Adicione transições suaves com Tailwind (`transition`, `ease-in-out`, `duration-300`).

---
