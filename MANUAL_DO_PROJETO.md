# MANUAL DEFINITIVO (SALVE ESTE ARQUIVO!)

Este guia foi desenhado para que você consiga recuperar seu projeto mesmo se perder o computador hoje.

---

## 🛑 PARTE 1: Configurando um Computador Novo (Do Zero)

Imagine que você acabou de comprar um notebook novo. Siga esta receita:

### 1. Instale as Ferramentas Básicas
Antes de tudo, seu computador precisa falar a língua dos programadores.
- **Node.js**: Baixe e instale a versão LTS em [nodejs.org](https://nodejs.org/).
- **Git**: Baixe e instale em [git-scm.com](https://git-scm.com/).
- **VS Code**: Seu editor de código. Baixe em [code.visualstudio.com](https://code.visualstudio.com/).

### 2. Baixe seu Projeto do GitHub ("Clone")
O código está salvo no cofre (GitHub). Vamos trazê-lo para a máquina.
1.  Crie uma pasta no seu computador (ex: `Meus Projetos`).
2.  Clique com o botão direito nessa pasta e selecione "Open in Terminal" (ou Git Bash).
3.  Digite o comando mágico:
    ```bash
    git clone https://github.com/johnsonnascimento-sys/salario-do-servidor.git
    ```
4.  Entre na pasta que foi criada:
    ```bash
    cd salario-do-servidor
    ```

### 3. Instale as Dependências
O que você baixou é apenas o "esqueleto" do código. Precisamos baixar os "músculos" (bibliotecas).
1.  No terminal (dentro da pasta do projeto), digite:
    ```bash
    npm install
    ```
    *Isso pode demorar um pouco. Ele vai criar uma pasta gigante chamada `node_modules`.*

### 4. Recupere as Chaves Secretas (CRÍTICO) ⚠️
Por segurança, as senhas do banco de dados **nunca** vão para o GitHub. Você precisa recriá-las manualmente.
1.  Abra a pasta do projeto no VS Code.
2.  Crie um arquivo novo na raiz chamado `.env.local` (exatamente assim, começando com ponto).
3.  Cole o seguinte conteúdo nele:

```ini
# Chaves do Projeto "Salario Servidor - DEV"
# (Copiadas em 15/01/2026)
VITE_SUPABASE_URL="https://fdzuykiwqzzmlzjtnbfi.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkenV5a2l3cXp6bWx6anRuYmZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTc4MzgsImV4cCI6MjA4NDA5MzgzOH0.bo7tyD_S_hVSs_cEuAzBBeQXy8YSQSKdez0b1Z8RNMc"
```

### 5. Teste se funcionou
No terminal:
```bash
npm run dev
```
Se abrir o site marrom/bege no navegador, PARABÉNS! Você configurou tudo. 🎉

---

## 🚀 PARTE 2: O Dia a Dia (Como Trabalhar)

Agora que está tudo instalado, aqui está o seu roteiro diário.

### Passo 1: Ligue o "Modo Rascunho"
Sempre que for mexer, rode:
```bash
npm run dev
```
- Acesso: `http://localhost:5173`
- Banco: Usa o de **TESTE** (pode apagar tudo sem medo).
- Use isso para mudar cores, textos, testar novas ideias.

### Passo 2: Salve seu Progresso (GitHub)
Fez algo legal? Salve na nuvem para não perder.
1.  Abra um novo terminal.
2.  Execute em ordem:
    ```bash
    git add .
    git commit -m "Explique aqui o que você fez"
    git push
    ```
    *Se der erro de login, o Git vai abrir uma janelinha pedindo sua senha do GitHub. É normal.*

### Passo 3: Mande para o Ar (Vercel)
Só faça isso quando tiver CERTEZA que está pronto para o público.
```bash
npx vercel --prod
```
- Ele vai pedir login na primeira vez (use seu email).
- Quando acabar, o site oficial (`salario-do-servidor.vercel.app`) estará atualizado.
- Banco: Este site usa o banco **OFICIAL/PRODUÇÃO** (Cuidado aqui!).

---

## ❓ Dúvidas Comuns

**P: Como sei se estou no banco de Dados Prod ou Dev?**
R: É automático.
- Se o site está no seu navegador com `localhost` -> Banco de Teste.
- Se o site está em `.vercel.app` -> Banco Oficial.

**P: Onde vejo os dados do banco?**
R: No site do Supabase. Você tem dois projetos lá:
- Projeto sem sufixo: É o oficial.
- Projeto com final `-DEV`: É o de teste. Use este para ver os usuários que você cria no `localhost`.

---

**Última atualização:** 25/01/2026
