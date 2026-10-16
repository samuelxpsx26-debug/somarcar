# 🚀 Agendamento SaaS — Guia Oficial de Deploy (Supabase + GitHub + Vercel)

> **Manual de Implantação e Publicação do SaaS em Produção**  
> Preparado especialmente para o fundador e administradores do projeto. Siga este passo a passo para colocar a plataforma no ar com banco de dados PostgreSQL na nuvem (Supabase) e hospedagem serverless de alta performance (Vercel).

---

## 📋 Sumário
1. [Passo 1: Criar o Banco de Dados no Supabase](#-passo-1-criar-o-banco-de-dados-no-supabase)
2. [Passo 2: Conectar o Banco Localmente e Aplicar as Tabelas](#-passo-2-conectar-o-banco-localmente-e-aplicar-as-tabelas)
3. [Passo 3: Enviar o Código para o GitHub](#-passo-3-enviar-o-código-para-o-github)
4. [Passo 4: Realizar o Deploy na Vercel](#-passo-4-realizar-o-deploy-na-vercel)
5. [Passo 5: Teste e Validação do Sistema Online](#-passo-5-teste-e-validação-do-sistema-online)
6. [Resumo da Arquitetura](#-resumo-da-arquitetura)

---

## 🐘 Passo 1: Criar o Banco de Dados no Supabase

O **Supabase** é um serviço gratuito de PostgreSQL na nuvem que suporta conexões pooler (ideais para funções serverless da Vercel).

1. Acesse **[supabase.com](https://supabase.com)** e crie uma conta gratuita (ou faça login com o seu GitHub).
2. No painel principal, clique no botão verde **"New Project"** (Novo Projeto).
3. Preencha os dados do projeto:
   - **Name**: `agendamento-saas` (ou o nome da sua empresa).
   - **Database Password**: Crie uma senha forte (ex: letras, números e símbolos).  
     ⚠️ **IMPORTANTE:** Guarde e anote esta senha em um local seguro; você precisará dela na string de conexão!
   - **Region**: Selecione **`São Paulo (sa-east-1)`** para menor tempo de resposta (latência ultrabaixa no Brasil).
   - **Pricing Plan**: `Free Plan` (Gratuito).
4. Clique em **"Create new project"** e aguarde cerca de 1 a 2 minutos até o banco ser provisionado.

### Como Obter as URLs de Conexão:
1. No menu lateral esquerdo do Supabase, clique no ícone de engrenagem **Project Settings** (Configurações do Projeto).
2. Clique na aba **Database** (Banco de Dados).
3. Role até a seção **Connection string** e clique na aba **URI**:
   - **Para `DATABASE_URL` (Modo Pooler - Transaction / Porta 6543):**
     - Selecione o modo **Transaction** (porta `6543`).
     - A URL terá um formato semelhante a:
       ```bash
       postgresql://postgres.[SEU-PROJECT-REF]:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
       ```
   - **Para `DIRECT_URL` (Modo Direto / Porta 5432):**
     - Selecione o modo **Session** (porta `5432`).
     - A URL terá o formato:
       ```bash
       postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJECT-REF].supabase.co:5432/postgres
       ```
   > 💡 **Dica:** Substitua `[SUA-SENHA]` pela senha que você criou ao criar o projeto.

---

## 🔄 Passo 2: Conectar o Banco Localmente e Aplicar as Tabelas

Agora vamos enviar as tabelas (`Tenant`, `Service`, `Appointment`) para o banco de dados do Supabase.

1. Abra o arquivo **`.env`** na raiz do projeto e cole as credenciais obtidas:
   ```env
   DATABASE_URL="postgresql://postgres.[SEU-PROJECT-REF]:SUA_SENHA_AQUI@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:SUA_SENHA_AQUI@db.[SEU-PROJECT-REF].supabase.co:5432/postgres"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

2. No terminal do Antigravity (ou PowerShell), execute o comando para criar as tabelas no Supabase:
   ```bash
   npx prisma db push
   ```
   *Você verá a mensagem confirmando que as tabelas `Tenant`, `Service` e `Appointment` foram criadas com sucesso no PostgreSQL.*

3. Execute o script de seed para criar o lojista inicial (**Barbearia Imperial**) e os 3 serviços no seu banco remoto:
   ```bash
   npx tsx prisma/seed.ts
   ```

---

## 🐙 Passo 3: Enviar o Código para o GitHub

1. Acesse **[github.com](https://github.com)** e faça login na sua conta.
2. Clique no botão **"New"** (ou no `+` no canto superior direito) para criar um novo repositório.
3. Configure o repositório:
   - **Repository name**: `agendamento-saas`
   - **Visibility**: `Private` (Privado - recomendado para proteger o código comercial) ou `Public`.
   - **NÃO** marque as opções de "Add a README file" ou ".gitignore" (pois já temos no projeto).
   - Clique em **"Create repository"**.
4. Copie a URL do seu repositório (ex: `https://github.com/SEU-USUARIO/agendamento-saas.git`).

5. No terminal do seu computador (na pasta do projeto), rode os seguintes comandos em sequência:

   ```bash
   # 1. Adicionar todos os arquivos ao controle de versão
   git add .

   # 2. Gravar o primeiro commit da versão MVP
   git commit -m "feat: MVP do Agendamento SaaS pronto para produção"

   # 3. Renomear a branch principal para main
   git branch -M main

   # 4. Vincular ao seu repositório no GitHub (substitua pelo seu link)
   git remote add origin https://github.com/SEU-USUARIO/agendamento-saas.git

   # 5. Fazer o envio definitivo do código
   git push -u origin main
   ```

---

## ⚡ Passo 4: Realizar o Deploy na Vercel

A **Vercel** é a plataforma criadora do Next.js e gerencia builds, SSL grátis (HTTPS) e infraestrutura global automaticamente.

1. Acesse **[vercel.com](https://vercel.com)** e entre com a sua conta do GitHub.
2. No painel da Vercel, clique no botão **"Add New..."** > **"Project"**.
3. Na lista de repositórios do GitHub, localize `agendamento-saas` e clique em **"Import"**.
4. Na tela de configuração do projeto:
   - **Project Name**: `agendamento-saas` (ou o nome que desejar).
   - **Framework Preset**: Deixe selecionado `Next.js`.
   - **Root Directory**: `./` (padrão).
5. Expanda a seção **"Environment Variables"** (Variáveis de Ambiente) e adicione as 3 variáveis essenciais:
   
   | Nome da Variável | Valor |
   | :--- | :--- |
   | `DATABASE_URL` | Sua URL Transaction Pooler do Supabase (`postgresql://...:6543/...`) |
   | `DIRECT_URL` | Sua URL Session Direct do Supabase (`postgresql://...:5432/...`) |
   | `NEXT_PUBLIC_APP_URL` | `https://agendamento-saas.vercel.app` (ou o domínio do seu projeto) |

6. Clique no botão **"Deploy"**.
7. Aguarde cerca de 1 a 2 minutos. A Vercel executará o comando de build automático (`prisma generate && next build`) e exibirá uma chuva de confetes com o link do seu site no ar! 🎉

---

## 🌐 Passo 5: Teste e Validação do Sistema Online

Assim que a Vercel finalizar o deploy:

1. **Acessar a Página do Estabelecimento (Link na Bio)**:
   - URL: `https://seu-projeto.vercel.app/barbearia-imperial`
   - Teste o fluxo completo no celular: seleção do serviço, escolha do dia e horário, preenchimento de nome/WhatsApp e geração do QR Code Pix.

2. **Acessar o Painel Administrativo**:
   - URL: `https://seu-projeto.vercel.app/admin/dashboard`
   - Navegue por **Agenda**, **Meus Serviços**, **Financeiro** e **Configurações**.

3. **Conectar Mercado Pago do Lojista**:
   - Acesse `https://seu-projeto.vercel.app/admin/settings`.
   - O profissional pode conectar a própria conta do Mercado Pago com 1 clique ou inserir seu Access Token pessoal.
   - O sinal Pix pago pelos clientes irá diretamente para a conta bancária dele!

4. **Configurar Domínio Próprio (Opcional)**:
   - Na Vercel, vá em **Project Settings** > **Domains**.
   - Adicione o seu domínio personalizado (ex: `agendapro.com.br` ou `meulink.bio`) e aponte os DNS conforme indicado pela Vercel.

---

## 🏛️ Resumo da Arquitetura

```mermaid
flowchart TD
    Cliente([📱 Cliente no Celular]) -->|Acessa Link na Bio /barbearia-imperial| Vercel[☁️ Vercel Serverless - Next.js 16]
    Vercel -->|Consulta Serviços & Lojista| Supabase[(🐘 Supabase PostgreSQL)]
    Cliente -->|Escolhe Horário & Solicita Reserva| Vercel
    Vercel -->|Cria Cobrança Pix via Token do Lojista| MercadoPago[💳 Mercado Pago do Profissional]
    MercadoPago -->|Retorna QR Code Dinâmico| Cliente
    MercadoPago -->|Notifica Pagamento Aprovado Webhook| Vercel
    Vercel -->|Atualiza Status para 'confirmed'| Supabase
    Profissional([💈 Painel do Profissional /admin]) -->|Visualiza Agendamento Confirmado em Tempo Real| Vercel
```

- **Frontend & Backend**: Next.js 16 (App Router) com Tailwind CSS v4.
- **Banco de Dados**: PostgreSQL gerenciado no Supabase com Prisma ORM.
- **Modelo de Negócio**: Multi-tenant com split financeiro direto (Caminho 2: Automação Total).
- **Hospedagem**: Vercel Serverless Edge Network com deploy contínuo integrado ao GitHub.
