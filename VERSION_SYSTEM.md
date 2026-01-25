# Sistema de Versionamento Automático

**Status:** ✅ Implementado
**Versão:** 1.0.0
**Data:** 24/01/2026

---

## 🎯 Objetivo

Permitir validação fácil de deploys através de um badge discreto que mostra:
- Versão atual (do `package.json`)
- Hash do commit Git
- Data e hora do build
- Branch utilizado

---

## 📦 Componentes

### 1. Script de Geração (`generate-version.js`)

**Local:** `scripts/generate-version.js`

**Função:**
- Extrai informações do Git (commit, branch)
- Lê versão do `package.json`
- Gera arquivo `public/version.json` com metadados
- Roda automaticamente no `prebuild` (antes do Vite)

**Informações Geradas:**
```json
{
  "version": "1.0.0",
  "commit": "b18ae22",
  "commitFull": "b18ae22...",
  "branch": "main",
  "isDirty": false,
  "buildDate": "2026-01-24T23:20:56.182Z",
  "buildTimestamp": 1769307656182
}
```

---

### 2. VersionBadge Component

**Local:** `src/components/ui/VersionBadge.tsx`

**Características:**
- Badge discreto com ícone de info
- Mostra: `v1.0.0 • b18ae22`
- Hover mostra tooltip expandido com:
  - Versão completa
  - Hash do commit
  - Branch
  - Data/hora do build
- Indicador visual para uncommitted changes (`*`)

**Design:**
- Texto pequeno (10px) com fonte mono
- Cor discreta (slate-400)
- Tooltip estilizado com seta
- Z-index 60 para ficar sobre outros elementos

---

### 3. Integração no ActionFooter

**Local:** `src/components/Calculator/ActionFooter.tsx`

**Posicionamento:**
- **Desktop:** Lado esquerdo inferior, abaixo do texto "Resultado Líquido"
- **Mobile:** Lado esquerdo, junto aos botões de exportação

**Comportamento:**
- Sempre visível (desktop e mobile)
- Não interfere com outros elementos
- Hover funcional em ambas as versões

---

## 🚀 Como Usar

### Durante Desenvolvimento

O badge mostra "dev" ou "local" quando o `version.json` não existe:

```bash
npm run dev
# Badge mostra: v1.0.0 • local
```

### No Build

O script roda automaticamente:

```bash
npm run build
# 1. Gera public/version.json
# 2. Vite copia para dist/
# 3. Badge mostra informações reais do commit
```

### Validar Deploy

1. Abra a calculadora em produção
2. Olhe o badge no canto inferior esquerdo
3. Hover para ver detalhes completos
4. Compare o hash do commit com o Git:
   ```bash
   git log --oneline -1
   # Deve bater com o hash exibido
   ```

---

## 🔍 Troubleshooting

### Badge não aparece

**Causa:** `version.json` não foi gerado ou não existe na pasta `public/`.

**Solução:**
```bash
node scripts/generate-version.js
npm run build
```

### Badge mostra "dev" ou "local"

**Causa:** Está rodando em desenvolvimento (`npm run dev`).

**Comportamento esperado:** Em dev, o badge sempre mostra valores de fallback.

### Hash do commit está errado

**Causa:** Build foi feito com uncommitted changes.

**Solução:** Badge mostra asterisco (`*`) quando há mudanças não comitadas. Commitar e buildar novamente.

### Badge não atualiza após deploy

**Causa:** Cache do navegador.

**Solução:**
- Hard refresh: `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
- Limpar cache do navegador

---

## 📝 Manutenção

### Atualizar Versão

Editar `package.json`:

```json
{
  "version": "1.1.0"
}
```

O badge exibirá automaticamente a nova versão no próximo build.

### Adicionar Informações

Editar `scripts/generate-version.js` para incluir mais campos:

```javascript
const versionInfo = {
  version: packageJson.version,
  commit,
  // ... campos existentes
  environment: process.env.NODE_ENV, // Exemplo de novo campo
};
```

Atualizar `VersionBadge.tsx` para exibir os novos campos.

---

## 🎨 Customização

### Mudar Posição do Badge

Editar `ActionFooter.tsx`:

```tsx
{/* Mover para canto direito */}
<div className="flex justify-end">
  <VersionBadge />
</div>
```

### Mudar Estilo

Editar `VersionBadge.tsx`:

```tsx
{/* Aumentar tamanho do texto */}
<div className="text-xs"> {/* era text-[10px] */}
  ...
</div>
```

### Ocultar em Produção

Adicionar condicional:

```tsx
{import.meta.env.DEV && <VersionBadge />}
```

---

## ✅ Benefícios

1. **Deploy Validation:** Saber exatamente qual versão está em produção
2. **Troubleshooting:** Identificar bugs por versão específica
3. **Traceability:** Rastrear quando cada build foi criado
4. **Automatic:** Nenhuma intervenção manual necessária
5. **Discrete:** Não interfere com UX da calculadora
6. **Universal:** Aparece automaticamente em todas as calculadoras

---

## 🔗 Arquivos Relacionados

- `scripts/generate-version.js` - Gerador de versão
- `src/components/ui/VersionBadge.tsx` - Componente visual
- `src/components/Calculator/ActionFooter.tsx` - Integração
- `package.json` - Configuração de versão e script prebuild
- `.gitignore` - Ignora `public/version.json` (gerado automaticamente)

---

**Última atualização:** 24/01/2026
**Implementado por:** Antigravity AI
