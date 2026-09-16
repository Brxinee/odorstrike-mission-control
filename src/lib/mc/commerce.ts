/**
 * Commercial truth for Smelloff / ODORSTRIKE.
 * This file is a representation of config/product.json + the operator brief.
 * It is NOT allowed to invent prices, claims, or SKUs.
 *
 * Conflicts are named, not silently resolved.
 */

export const BRAND = {
  name: "Smelloff",
  product: "ODORSTRIKE",
  legalName: "Smelloff (Sole Proprietorship)",
  founder: "Jogdhande Nikhil Patil",
  city: "Hyderabad",
  state: "Telangana",
  country: "India",
  website: "https://smelloff.in",
  admin: "https://admin.smelloff.in",
  supportEmail: "smelloffsupport@gmail.com",
  supportPhoneDisplay: "+91 93929 74031",
  whatsapp: "+919392974031",
} as const;

export const PRODUCT = {
  name: "ODORSTRIKE",
  size: "50ml",
  /** Catalog / storefront SKU from config/product.json — authoritative for PDP + schema. */
  catalogSku: "OS-001-50ML",
  mpn: "SMLF-ODST-50",
  /** Alias used in some operator briefs and older admin copy. Not the catalog SKU. */
  operatorAlias: "ODS-50",
  skuConflict:
    "Operator brief says SKU ODS-50. Authoritative storefront config (config/product.json, odorstrike.html, products.json) says OS-001-50ML. Do not silently rename. Treat OS-001-50ML as catalog truth until a spec change lands.",
  pricePaise: 22900,
  mrpPaise: 49900,
  codFeePaise: 6000,
  priceCodPaise: 28900,
  currency: "INR",
  minQty: 1,
  maxQty: 10,
  spraysApprox: 250,
  claim:
    "Up to 8 hours of odor protection on fabric under normal office/commute conditions.",
  category: "Pocket-sized fabric odor reset / fabric odor control spray for clothing.",
  inScope: [
    "shirts",
    "t-shirts",
    "hoodies",
    "jackets",
    "blazers",
    "jeans",
    "trousers",
    "uniforms",
    "everyday clothing",
  ],
  outOfScope: [
    "shoes",
    "helmets",
    "room spray",
    "sofas",
    "cars",
    "sports equipment",
    "skin",
    "hair",
    "leather",
    "suede",
  ],
  formulaVersion: "v3.1",
  heroActives: ["HPβCD", "Zinc PCA", "Triethyl Citrate", "Zinc Gluconate"],
  neverPublish: "Formula percentages / concentrations. Ingredient names are public.",
} as const;

/** Planning constants. Demand is INFERRED until a fitted model exists. */
export const PLANNING = {
  expectedDailyDemand: 3.1,
  expectedDailyProvenance:
    "INFERRED — 12-order DEMO sample. No seasonality, no stockout-censoring, day-of-week not fitted.",
  leadTimeDays: 9,
  leadTimeProvenance: "CONFIG — settings.lead_time_days. Not a measured supplier SLA.",
  safetyStockUnits: 12,
  safetyProvenance: "CONFIG — settings.safety_stock_units.",
  reorderCycleHintDays: 20,
  reorderCycleProvenance: "INFERRED heuristic for DEMO reorder windows — not a survival model.",
} as const;

export const SHIPPING = {
  prepaid: "Free shipping pan-India on prepaid UPI / card / netbanking",
  cod: "₹60 handling charge on Cash on Delivery (collectable total ₹289)",
  dispatch: "Within 48 hours of confirmation",
  transitMetros: "3–5 business days",
  transitTier23: "5–7 business days",
  origin: "Hyderabad, Telangana, India",
} as const;

export const RETURNS = {
  windowDays: 7,
  condition: "Bottle must be at least 80% full and in original packaging",
} as const;

export const PROVENANCE = {
  COMMERCIAL_SPEC: "config/product.json + operator constitution",
  STOREFRONT: "Brxinee/Smelloff @ c1a4e21 (2026-09-15)",
  ADMIN: "Brxinee/Admin @ 17fd2d6 (2026-09-16)",
  DEMO: "Synthetic operating sample — not production customers",
  DETECTED: "Derived from demo ledger in this Mission Control instance",
  PRODUCTION_UNVERIFIED: "Claimed in git, not verified against live schema",
} as const;

export const SUPABASE_PROJECT = "tnuqjydmoxczdjnsgpci";
export const EMAIL_FROM = "ODORSTRIKE <orders@smelloff.in>";
