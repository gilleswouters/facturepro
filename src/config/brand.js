const brand = {
  facturepro: {
    name: 'FacturePro',
    domain: 'facturepro.be',
    defaultLang: 'fr',
    crosslinkName: 'FactuurPro.be',
    crosslinkUrl: 'https://factuurpro.be',
  },
  factuurpro: {
    name: 'FactuurPro',
    domain: 'factuurpro.be',
    defaultLang: 'nl',
    crosslinkName: 'FacturePro.be',
    crosslinkUrl: 'https://facturepro.be',
  }
};

export default brand[import.meta.env.VITE_BRAND || 'facturepro'];
