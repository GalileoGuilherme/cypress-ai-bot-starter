# Cypress AI Bot Starter

Projeto de que demonstra geração de testes Cypress para UI e API, com uma aplicação local reproduzível e modo simulado que não exige chave de IA.

## Requisitos

- Node.js 18 ou superior
- npm
- Chave da API OpenAI somente para geração real com IA

## O que o projeto demonstra

- Geração de specs Cypress de UI e API por IA ou por templates simulados.
- Testes E2E de uma aplicação local, sem depender de serviços externos.
- Testes unitários do CLI com o runner nativo do Node.js.

## Estrutura

```text
cypress/
  bot/                 # CLI, prompts e testes unitários
  e2e/generated/       # specs carregados pelo Cypress
  support/             # configuração compartilhada dos testes
demo/                  # aplicação local usada pelos exemplos
cypress.config.js
```

## Instalação

```bash
npm install
```

## Executar a demo e os testes

Inicie a aplicação de demonstração em um terminal:

```bash
npm run demo
```

Ela ficará disponível em `http://localhost:3000`. A tela de login usa estas credenciais locais:

```text
E-mail: demo@example.com
Senha:  Cypress123!
```

O endpoint de exemplo `GET /api/wallet/balance/demo-wallet` retorna uma carteira fixa com saldo de demonstração. Em outro terminal, execute os testes Cypress incluídos:

```bash
npm run cypress:run
```

Para abrir a interface do Cypress:

```bash
npm run cypress:open
```

A aplicação é apenas uma demo local. Credenciais fixas e endpoints simplificados não devem ser usados em produção.

## Gerar testes sem chave de API

O modo `--mock` não usa IA: ele gera templates determinísticos para os fluxos de login e saldo da demo. A descrição informada é usada como título do teste. Nenhuma chave ou chamada externa é necessária:

```bash
npm run bot:ui -- --mock "Validar login e acesso ao dashboard"
npm run bot:api -- --mock "Validar saldo da carteira demo"
```

Os arquivos gerados são salvos em `cypress/e2e/generated/`, a pasta monitorada pelo Cypress. Com a demo ainda rodando, execute `npm run cypress:run` para validar os specs gerados junto com os exemplos `demo-login.cy.js` e `demo-wallet-api.cy.js`, que já vêm incluídos.

## Geração com OpenAI

1. Copie `.env.example` para `.env`.
2. Insira sua própria chave no campo `OPENAI_API_KEY` e, se necessário, altere `OPENAI_MODEL`.
3. Execute um dos comandos sem `--mock`, por exemplo:

```bash
npm run bot:ui -- "Validar login e acesso ao dashboard"
npm run bot:api -- "Validar saldo da carteira demo"
```

Não compartilhe nem versione o arquivo `.env`. A geração real requer acesso à API e pode consumir créditos. Todo código gerado deve ser revisado antes de ser executado.

## Testes do bot

Os testes unitários usam o runner nativo do Node.js e não precisam de chave de API:

```bash
npm test
```

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run demo` | Inicia a aplicação local de demonstração |
| `npm run cypress:open` | Abre a interface do Cypress |
| `npm run cypress:run` | Executa os specs encontrados pelo Cypress |
| `npm run bot:ui -- <descrição>` | Gera um teste E2E com OpenAI |
| `npm run bot:api -- <descrição>` | Gera um teste de API com OpenAI |
| `npm run bot:ui -- --mock <descrição>` | Gera um teste UI simulado, sem chave |
| `npm run bot:api -- --mock <descrição>` | Gera um teste API simulado, sem chave |
| `npm test` | Executa os testes unitários do bot |
