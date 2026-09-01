export const SITE = {
  name: "VYXN Digital",
  domain: "https://vyxndigital.com",
  // Site de vendas / checkout externo
  checkoutUrl: "https://vyxndigital.com/checkout",
  contactEmail: "contato@vyxndigital.com",
};

export const checkoutLink = (planSlug: string) =>
  `${SITE.checkoutUrl}?plano=${encodeURIComponent(planSlug)}`;
