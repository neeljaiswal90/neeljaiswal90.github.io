import { getPublishableMedia } from './media';

export type CompanyBrandId = 'mint-mobile' | 'inspire-brands' | 'best-buy' | 'target' | 'allianz';

export interface CompanyBrand {
  id: CompanyBrandId;
  company: string;
  mediaId: string;
  assetPath: string;
  shape: 'square' | 'wide';
}

const brandSpecs = [
  { id: 'mint-mobile', company: 'Mint Mobile', mediaId: 'media.brand.mint_mobile', shape: 'square' },
  { id: 'inspire-brands', company: 'Inspire Brands', mediaId: 'media.brand.inspire_brands', shape: 'wide' },
  { id: 'best-buy', company: 'Best Buy', mediaId: 'media.brand.best_buy', shape: 'wide' },
  { id: 'target', company: 'Target', mediaId: 'media.brand.target', shape: 'square' },
  { id: 'allianz', company: 'Allianz', mediaId: 'media.brand.allianz', shape: 'wide' },
] as const;

export const companyBrands: readonly CompanyBrand[] = brandSpecs.map((brand) => ({
  ...brand,
  assetPath: getPublishableMedia(brand.mediaId).assetPath,
}));

const brandByCompany = new Map<string, CompanyBrand>();
for (const brand of companyBrands) brandByCompany.set(brand.company, brand);
brandByCompany.set('Mint Home Internet', companyBrands[0]!);

export function getCompanyBrand(company: string): CompanyBrand {
  const brand = brandByCompany.get(company);
  if (!brand) throw new Error(`Missing company brand mapping: ${company}`);
  return brand;
}
