describe('Demo de API de carteira', () => {
  it('retorna o saldo da carteira de demonstração', () => {
    cy.request('GET', '/api/wallet/balance/demo-wallet').then(({ status, body }) => {
      expect(status).to.eq(200)
      expect(body).to.have.all.keys('walletId', 'balance', 'currency')
      expect(body).to.deep.equal({
        walletId: 'demo-wallet',
        balance: 125.5,
        currency: 'BRL',
      })
    })
  })
})
