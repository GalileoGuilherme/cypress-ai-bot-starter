describe('Demo de login', () => {
  it('autentica e abre o dashboard', () => {
    cy.visit('/login')
    cy.intercept('POST', '/api/login').as('login')
    cy.get('[data-testid=email]').type('demo@example.com')
    cy.get('[data-testid=password]').type('Cypress123!')
    cy.get('[data-testid=submit]').click()
    cy.wait('@login').its('response.statusCode').should('eq', 200)
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid=welcome]').should('contain', 'Bem-vindo')
  })
})
