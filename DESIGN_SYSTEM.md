# 🎨 Design System - Salário do Servidor

> **IMPORTANTE**: Este documento define a identidade visual do projeto. Siga estas diretrizes em TODAS as alterações de UI.

---

## 📊 Cores

### Paleta Principal (Tailwind Tokens)

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#14b8a6` (Teal) | Destaques, links, ícones, estados ativos |
| `secondary` | `#2563eb` (Blue) | Botões principais, gradientes, CTAs |
| `navy-dark` | `#0f172a` | Backgrounds escuros, footer |
| `background-light` | `#f8fafc` | Background claro padrão |
| `background-dark` | `#0f172a` | Background modo escuro |

### Gradientes

```css
/* Gradiente da Marca (Brand) */
.brand-gradient {
  background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
}

/* Texto com Gradiente */
.gradient-text {
  background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Cores de Estado

| Estado | Cor Tailwind |
|--------|--------------|
| Sucesso | `emerald-500` / `green-500` |
| Erro | `red-500` |
| Aviso | `amber-500` |
| Info | `blue-500` |

---

## 🔤 Tipografia

### Fonte Principal
- **Família**: `Plus Jakarta Sans`
- **Importação**: Google Fonts (já no `index.html`)
- **Token Tailwind**: `font-display`

### Hierarquia de Títulos

| Elemento | Classes |
|----------|---------|
| H1 (Página) | `text-3xl md:text-4xl font-extrabold` |
| H2 (Seção) | `text-2xl font-bold` |
| H3 (Card) | `text-lg font-bold` |
| H4 (Subsection) | `text-sm font-bold uppercase tracking-widest` |
| Label | `text-[10px] font-bold uppercase tracking-widest text-slate-500` |
| Body | `text-sm text-slate-600 dark:text-slate-300` |

---

## 🎭 Ícones

### Biblioteca Oficial
> ⚠️ **Usar APENAS Lucide React**. NÃO usar Material Symbols.

```tsx
import { Heart, Settings, ArrowLeft } from 'lucide-react';

// Tamanhos padrão
<Heart className="w-4 h-4" />  // Pequeno (botões)
<Heart className="w-5 h-5" />  // Médio (navegação)
<Heart className="w-6 h-6" />  // Grande (destaque)
<Heart className="w-8 h-8" />  // Extra grande (hero)
```

### Ícones Mais Usados

| Contexto | Ícone |
|----------|-------|
| Voltar | `ArrowLeft` |
| Configurações | `Settings` |
| Doação/Apoio | `Heart` |
| Modo Claro | `Sun` |
| Modo Escuro | `Moon` |
| Email | `Mail` |
| Localização | `MapPin` |
| Menu | `Menu` |
| Fechar | `X` |
| Copiar | `Copy` |
| Confirmação | `Check` |
| Adicionar | `Plus`, `PlusCircle` |
| Remover | `Trash2`, `X` |
| Dinheiro | `DollarSign` |
| Lista | `List` |
| Recibo | `Receipt` |

---

## 🔘 Botões

### Classes Utilitárias (index.css)

```tsx
// Botão Base
<button className="btn btn-md btn-primary">
  Ação Principal
</button>

// Variantes de Tamanho
className="btn btn-sm"   // Pequeno
className="btn btn-md"   // Médio (padrão)
className="btn btn-lg"   // Grande

// Variantes de Estilo
className="btn btn-primary"    // Gradiente azul→teal, branco
className="btn btn-secondary"  // Branco com borda
className="btn btn-ghost"      // Transparente, hover sutil
className="btn btn-danger"     // Vermelho para ações destrutivas
```

### Botão de Destaque (Apoiar)

```tsx
<Link 
  to="/apoiar" 
  className="btn btn-sm bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold hover:shadow-lg hover:shadow-rose-500/30 transition-all"
>
  <Heart className="w-4 h-4" />
  Apoiar
</Link>
```

---

## 🃏 Cards

### Card Padrão

```tsx
<div className="card p-6">
  {/* Conteúdo */}
</div>

// Ou manualmente:
<div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-card">
```

### Card com Título de Seção

```tsx
<div className="card p-6">
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
    <Settings className="w-4 h-4" />
    Título da Seção
  </h3>
  {/* Conteúdo */}
</div>
```

---

## 📐 Espaçamento

### Container Principal

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Conteúdo */}
</div>

// Ou usando a classe utilitária:
<div className="container-app">
```

### Gaps Padrão

| Contexto | Gap |
|----------|-----|
| Entre cards | `gap-8` |
| Entre items em card | `gap-4` ou `gap-6` |
| Entre label e input | `gap-1.5` (mb-1.5) |
| Grid de formulário | `gap-4` ou `gap-6` |

---

## 🌗 Modo Escuro

### Padrão de Cores

```tsx
// Backgrounds
className="bg-white dark:bg-slate-800"
className="bg-slate-50 dark:bg-slate-900"

// Textos
className="text-slate-900 dark:text-white"
className="text-slate-600 dark:text-slate-300"
className="text-slate-500 dark:text-slate-400"

// Bordas
className="border-slate-200 dark:border-slate-700"
```

---

## 📝 Inputs

### Input Padrão

```tsx
<input 
  className="input"
  placeholder="Placeholder..."
/>

// Ou manualmente:
<input 
  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
/>
```

### Select

```tsx
<select className="input">
  <option>Opção 1</option>
</select>
```

---

## 🎯 Border Radius

| Elemento | Classe |
|----------|--------|
| Cards | `rounded-2xl` |
| Inputs | `rounded-xl` |
| Botões grandes | `rounded-xl` |
| Botões pequenos | `rounded-lg` |
| Pills/Badges | `rounded-full` |
| Accordions | `rounded-2xl` |

---

## 🌊 Sombras

| Classe | Uso |
|--------|-----|
| `shadow-card` | Cards, inputs |
| `shadow-card-hover` | Cards em hover |
| `shadow-modal` | Modais, overlays |
| `shadow-lg shadow-secondary/25` | Botões primários |

---

## 📁 Estrutura de Arquivos CSS

```
src/
├── index.css          # Design system e classes utilitárias
├── tailwind.config.js # Tokens de cor e fonte
└── components/
    ├── Accordion.tsx  # Componente reutilizável
    └── Inputs.tsx     # Componentes de input
```

---

## ✅ Checklist de Revisão de UI

Antes de finalizar qualquer alteração de UI, verifique:

- [ ] Usando Lucide React (não Material Symbols)
- [ ] Cores usando tokens (`primary`, `secondary`) não hardcoded
- [ ] Border-radius consistente (`rounded-2xl` para cards)
- [ ] Fonte `Plus Jakarta Sans` aplicada
- [ ] Modo escuro funcionando (`dark:` variants)
- [ ] Espaçamento usando gap/padding padrão
- [ ] Botões usando classes `btn-*`

---

## 🚫 O que NÃO fazer

```tsx
// ❌ ERRADO: Material Symbols
<span className="material-symbols-outlined">favorite</span>

// ✅ CORRETO: Lucide React
<Heart className="w-5 h-5" />

// ❌ ERRADO: Cores hardcoded
className="text-blue-600"
className="bg-indigo-700"

// ✅ CORRETO: Tokens ou cores semânticas
className="text-secondary"
className="text-primary"

// ❌ ERRADO: Border-radius inconsistente
className="rounded-md"  // Em um card
className="rounded-3xl" // Em outro card

// ✅ CORRETO: Padrão consistente
className="rounded-2xl" // Todos os cards
```

---

*Última atualização: Janeiro/2026*
