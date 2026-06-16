/** Types alignés sur les DTOs FastAPI (camelCase). */

export interface ZlecafDutyResponse {
  hsCode: string;
  originCountryIso: string;
  calculationYear: number;
  countryGroup: string;
  productCategory: string;
  transitionStartYear: number;
  yearsElapsed: number;
  initialDutyRate: number;
  annualReductionRate: number;
  reductionFraction: number;
  appliedDutyRate: number;
  scheduleYears: number;
  excluded: boolean;
  savingsFraction: number;
  formula?: string;
}

export interface ZlecafDutyRequest {
  hsCode: string;
  originCountryIso: string;
  initialDutyRate: number;
  year?: number;
  sensitive?: boolean;
}

export interface ZlecafProjectionResponse {
  hsCode: string;
  originCountryIso: string;
  initialDutyRate: number;
  projections: ZlecafDutyResponse[];
}

export interface AfcftaValidateRequest {
  origin: string;
  destination: string;
  hsCode: string;
  costMatiereLocale?: number;
  mainOeuvreLocale?: number;
  fraisLocaux?: number;
  prixVenteExport: number;
  declaredValueLocal: number;
  quantity?: number;
  year?: number;
  sensitive?: boolean | null;
}

export interface AfcftaValidateResponse {
  eligible: boolean;
  originPercentage: number;
  thresholdRequired: number;
  sensitiveProduct: boolean;
  productCategory: string;
  countryGroup: string;
  standardRate: number;
  appliedRate: number;
  savingsLocalCurrency: number;
  savingsFraction: number;
  zlecafDetails: ZlecafDutyResponse;
  recommendations: string[];
}

export interface CertificateDraftRequest {
  exporterName: string;
  exporterAddress: string;
  importerName: string;
  importerAddress: string;
  origin: string;
  destination: string;
  hsCode: string;
  productDescription: string;
  quantity?: number;
  grossWeightKg?: number | null;
  originPercentage: number;
  invoiceNumber?: string | null;
}

export interface CertificateDraftResponse {
  draftId: string;
  status: string;
  title: string;
  fields: Record<string, unknown>;
  requiredDocuments: string[];
  disclaimer: string;
}

export interface FiscalLine {
  code: string;
  label: string;
  base: number;
  rate: number;
  amount: number;
}

export interface CameroonFiscalRequest {
  cifValue: number;
  hsCode: string;
  originCountryIso: string;
  year?: number;
  sensitive?: boolean;
  applyZlecaf?: boolean;
}

export interface CameroonFiscalResponse {
  cifValue: number;
  lines: FiscalLine[];
  totalTaxes: number;
  totalEstimatedCostPctCif: number;
  ddiRateApplied: number;
  zlecafAppliedRate: number | null;
  disclaimer: string;
}

export interface PortFeesRequest {
  port?: string;
  containerType?: string;
  weightKg?: number | null;
}

export interface PortFeesResponse {
  port: string;
  containerType: string;
  weightKg: number | null;
  lines: { code: string; label: string; amountMin: number; amountMax: number }[];
  totalMin: number;
  totalMax: number;
  currency: string;
  disclaimer: string;
}

export interface CamcisRegimeRequest {
  nature?: string;
  valueLocal?: number;
  temporaryStayDays?: number | null;
  warehouse?: boolean;
  reexportPlanned?: boolean;
}

export interface CamcisRegimeResponse {
  regimeCode: string;
  regimeLabel: string;
  nature: string;
  explanation: string;
  documentsRequired: string[];
  camcisFamily: string;
}

export interface PhoneImportPackRequest {
  hsCode?: string;
  unitValueCif: number;
  quantity?: number;
  originCountryIso?: string;
}

export interface PhoneImportPackResponse {
  hsCode: string;
  isPhoneChapter: boolean;
  unitValueCif: number;
  quantity: number;
  fiscalPerUnit: Record<string, unknown>;
  fiscalTotal: Record<string, unknown>;
  checklist: { step: number; title: string; description: string; mandatory: boolean }[];
  reformNote: string;
}

export interface LandedCostRequest {
  cifValue: number;
  hsCode: string;
  originCountryIso: string;
  port?: string;
  containerType?: string;
  weightKg?: number | null;
  quantity?: number;
}

export interface LandedCostResponse {
  customsTaxes: CameroonFiscalResponse;
  portFees: PortFeesResponse;
  grandTotalMin: number;
  grandTotalMax: number;
  currency: string;
}

export interface AnalyticsSummaryResponse {
  simulationsCount: number;
  afcftaSavingsEstimateLocal: number;
  topCorridors: { route: string; count: number }[];
  topProducts: { hsCode: string; count: number }[];
}

export interface ReferenceVersionsResponse {
  tecCemac: string;
  zlecafTariffEngine: string;
  hsCatalogue: string;
  africaVatRates: string;
  engineVersion: string;
}

export interface CompareRequest {
  origin: string;
  destinations: string[];
  hsCode: string;
  declaredValueLocal: number;
  quantity?: number;
  costMatiereLocale?: number;
  mainOeuvreLocale?: number;
  fraisLocaux?: number;
  prixVenteExport?: number;
  year?: number;
}

export interface BackendCompareResultRow {
  rank: number;
  destination: string;
  currency: string;
  totalTaxLocal: number;
  totalTaxUSD: number;
  dutyPaidLocal: number;
  vatPaidLocal: number;
  isEligiblePrefAfCFTA: boolean;
  appliedTariffRate: number;
}

export interface BackendCompareResponse {
  origin: string;
  hsCode: string;
  year: number;
  destinationsCount: number;
  summary: {
    cheapestDestination: string;
    mostExpensiveDestination: string;
    spreadUSD: number;
    spreadLocal: number;
  };
  results: BackendCompareResultRow[];
}

export interface UsageDayPoint {
  date: string;
  simulations: number;
}

export interface BillingCountryItem {
  code: string;
  name: string;
  currency: string;
  checkoutEnabled: boolean;
}

export interface BillingCountriesResponse {
  countries: BillingCountryItem[];
}
