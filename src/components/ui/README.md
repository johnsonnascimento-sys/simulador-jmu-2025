# Componentes UI Reutilizáveis

Biblioteca de componentes UI padronizados seguindo o `DESIGN_SYSTEM.md`.

## Componentes Disponíveis

### Button

Botão com variantes e tamanhos padronizados.

**Variantes:**
- `primary` - Gradiente azul→teal (padrão)
- `secondary` - Branco com borda
- `ghost` - Transparente
- `danger` - Vermelho para ações destrutivas

**Tamanhos:**
- `sm` - Pequeno
- `md` - Médio (padrão)
- `lg` - Grande

**Exemplo:**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Salvar
</Button>

<Button variant="danger" size="sm">
  Excluir
</Button>
```

---

### Input

Input de texto com label, error e helper text.

**Props:**
- `label` - Label do campo
- `error` - Mensagem de erro
- `helperText` - Texto de ajuda

**Exemplo:**
```tsx
import { Input } from '@/components/ui';

<Input
  label="Nome"
  placeholder="Digite seu nome"
  helperText="Nome completo"
  error={errors.name}
/>
```

---

### Select

Select com label, error e helper text.

**Props:**
- `label` - Label do campo
- `error` - Mensagem de erro
- `helperText` - Texto de ajuda
- `options` - Array de opções (opcional)

**Exemplo:**
```tsx
import { Select } from '@/components/ui';

<Select
  label="Cargo"
  options={[
    { value: 'analista', label: 'Analista' },
    { value: 'tec', label: 'Técnico' }
  ]}
/>

// Ou com children
<Select label="Período">
  <option value="0">2025</option>
  <option value="1">2026</option>
</Select>
```

---

### Card

Card com Header e Content opcionais.

**Subcomponentes:**
- `Card.Header` - Cabeçalho do card
- `Card.Content` - Conteúdo do card

**Exemplo:**
```tsx
import { Card } from '@/components/ui';

<Card>
  <Card.Header>
    <h3 className="text-lg font-bold">Título</h3>
  </Card.Header>
  <Card.Content>
    <p>Conteúdo do card</p>
  </Card.Content>
</Card>

// Ou sem subcomponentes
<Card className="p-6">
  <p>Conteúdo simples</p>
</Card>
```

---

## Design Tokens

Todos os componentes seguem os tokens definidos no `DESIGN_SYSTEM.md`:

- **Cores:** `primary`, `secondary`, `navy-dark`
- **Fonte:** `Plus Jakarta Sans` (font-display)
- **Border Radius:** `rounded-xl` (inputs), `rounded-2xl` (cards)
- **Sombras:** `shadow-card`
- **Modo Escuro:** Suporte completo com `dark:` variants

---

## Boas Práticas

1. **Use os componentes** ao invés de criar elementos HTML diretamente
2. **Mantenha consistência** usando as variantes e tamanhos padrão
3. **Não sobrescreva estilos** a menos que absolutamente necessário
4. **Use className** apenas para ajustes de layout (margin, padding, width)

---

**Última atualização:** 23/01/2026
