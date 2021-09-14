
const whitelistDomains = [
  'custom.sataylorstudios.com',
  'www.sataylorcustoms.com',
  'sataylorcustoms.com',
];

const whitelistBrands = ['sataylor-customs', 'sataylorcustoms'];

const SATAYLORCUSTOMS = [].concat(whitelistDomains, whitelistBrands);

// move to a util file
const categorySlug = (id) => {
  if(SATAYLORCUSTOMS.includes(id)) {return 'SATAYLOR-CUSTOMS';}
  return null;
};


export { categorySlug as default, whitelistDomains, whitelistBrands};