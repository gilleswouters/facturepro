const brands = {
  facturepro: {
    id: 'facturepro',
    name: 'FacturePro',
    domain: 'facturepro.be',
    defaultLang: 'fr',
    crosslinkName: 'FactuurPro.be',
    crosslinkUrl: 'https://factuurpro.be',
  },
  factuurpro: {
    id: 'factuurpro',
    name: 'FactuurPro',
    domain: 'factuurpro.be',
    defaultLang: 'nl',
    crosslinkName: 'FacturePro.be',
    crosslinkUrl: 'https://facturepro.be',
  }
};

const getBrand = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('factuurpro')) {
      return brands.factuurpro;
    }
  }
  // Fallback if running in SSR/tests or manually overridden
  const envBrand = import.meta.env.VITE_BRAND || 'facturepro';
  return brands[envBrand] || brands.facturepro;
};

export default getBrand();
