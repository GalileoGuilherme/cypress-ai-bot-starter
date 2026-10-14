```markdown
# Cypress AI Bot Starter

> Projeto Cypress com *bot de IA* para gerar scripts de automação rapidamente (UI e API).

## 📦 Pré-resquisitos

- Node.js 18+ (LTS recomendado)
- Git
- Uma chave de API da OpenAI ou outro modelo compatível

## 🗂 Estrutura do projeto

```text
cypress-ai-bot-starter/
  ├─ cypress/
  │   ├─ e2e/
  │   │   └─ generated/        # testes gerados
  │   └─ support/
  └─ cypress/bot/
      ├─ index.mjs               # bot principal
      └─ prompts/
          ├─ ui.md               # prompt base UI
          └─ api.md              # prompt base API
  ├─ cypress.config.js
  ├─ package.json
  └─ .env.example

```

## ⚙️ Configuração

1. Copie `.env.example` para `.env` e preencha sua chave:
```env
OPENAI_API_KEY = coloque_sua_chave_aqui
OPENAI_MODEL = gpt-4o-mini

```


2. Instale dependências:
```bash
npm install

```



## 🚀 Scripts NPM disponíveis

```bash
# Abrir Cypress UI
npm run cypress:open

# Rodar todos os testes headless
npm run cypress:run

# Gerar teste UI
npm run bot:ui -- "Descrição do teste"

# Gerar teste API
npm run bot:api -- "Descrição do teste"

```

## 📌 Exemplos de execução

### 1) Gerar teste de UI

```bash
npm run bot:ui -- "Criar teste de login que valida redirecionamento para /dashboard"

```

*Saída esperada:*

> ✅ Teste gerado em: `cypress/e2e/generated/1700000000000_criar-teste-de-login-que-valida-redirecionamento-para-dashboard.cy.js`

Arquivo gerado (`cypress/e2e/generated/...`) com conteúdo semelhante a:

```javascript
describe('Login', () => {
  it('Deve logar e ir para dashboard', () => {
    cy.visit('/login');
    cy.get('[data-testid=email]').type('usuario@teste.com');
    cy.get('[data-testid=password]').type('Senha@123');
    cy.get('[data-testid=submit]').click();
    cy.url().should('include', '/dashboard');
  });
});

```

### 2) Gerar teste de API

```bash
npm run bot:api -- "Validar GET /wallet/balance/{walletId} retorna status 200 e campo balance"

```

*Saída esperada:*

> ✅ Teste gerado em: `cypress/e2e/generated/1700000000000_validar-get-wallet-balance-walletid.cy.js`

Arquivo gerado (`cypress/e2e/generated/...`) com conteúdo semelhante a:

```javascript
describe('API Wallet', () => {
  it('Deve retornar balance corretamente', () => {
    cy.request('GET', '/wallet/balance/{walletId}').its('status').should('eq', 200);
    cy.request('GET', '/wallet/balance/{walletId}').its('body').should('have.property', 'balance');
  });
});

```

## ⚡ Observações

* Se ocorrer erro de *quota* (429), verifique a chave da OpenAI ou use outro modelo compatível.
* Ajuste `baseUrl` no `cypress.config.js` conforme seu ambiente.
* Os testes gerados podem precisar de pequenas adaptações dependendo do app.

## 📝 Licença

Use livremente como template para projetos de QA e automação
```

```
