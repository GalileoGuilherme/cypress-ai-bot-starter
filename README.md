# Cypress AI Bot Starter

> Projeto Cypress com *bot de IA* para gerar scripts de automação rapidamente (UI e API).

## 📦 Pré-requisitos

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
