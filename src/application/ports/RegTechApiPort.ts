import type { Country, HSProduct, SimulationResult } from "@/domain/reference/types";
import type {
  BatchPayload,
  BatchResponse,
  ClassifyPayload,
  ClassifyResult,
  SimulatePayload,
} from "@/infrastructure/http/regtechApi";
import type {
  AfcftaValidateRequest,
  AfcftaValidateResponse,
  AnalyticsSummaryResponse,
  CameroonFiscalRequest,
  CameroonFiscalResponse,
  CamcisRegimeRequest,
  CamcisRegimeResponse,
  CertificateDraftRequest,
  CertificateDraftResponse,
  LandedCostRequest,
  LandedCostResponse,
  PhoneImportPackRequest,
  PhoneImportPackResponse,
  PortFeesRequest,
  PortFeesResponse,
  ReferenceVersionsResponse,
  ZlecafDutyRequest,
  ZlecafDutyResponse,
  ZlecafProjectionResponse,
} from "@/infrastructure/http/regtechApiTypes";
import type { BackendSubscriptionResponse } from "@/infrastructure/http/monetizationMapper";

export interface RegTechApiPort {
  getCountries(options?: {
    pilotOnly?: boolean;
    africaOnly?: boolean;
  }): Promise<Country[]>;
  getTariffs(options?: { catalog?: "afcfta" }): Promise<HSProduct[]>;
  simulate(payload: SimulatePayload): Promise<SimulationResult>;
  classify(payload: ClassifyPayload): Promise<ClassifyResult>;
  batch(payload: BatchPayload): Promise<BatchResponse>;
  getMonetizationPlans(): Promise<BackendSubscriptionResponse[]>;
  getZlecafProjection(params: {
    hsCode: string;
    originCountryIso: string;
    initialDutyRate?: number;
    sensitive?: boolean;
  }): Promise<ZlecafProjectionResponse>;
  computeZlecafDuty(payload: ZlecafDutyRequest): Promise<ZlecafDutyResponse>;
  validateAfcftaOrigin(payload: AfcftaValidateRequest): Promise<AfcftaValidateResponse>;
  createCertificateDraft(payload: CertificateDraftRequest): Promise<CertificateDraftResponse>;
  computeCameroonFiscal(payload: CameroonFiscalRequest): Promise<CameroonFiscalResponse>;
  estimatePortFees(payload: PortFeesRequest): Promise<PortFeesResponse>;
  suggestCamcisRegime(payload: CamcisRegimeRequest): Promise<CamcisRegimeResponse>;
  getPhoneImportPack(payload: PhoneImportPackRequest): Promise<PhoneImportPackResponse>;
  computeLandedCost(payload: LandedCostRequest): Promise<LandedCostResponse>;
  getMonetizationAnalytics(): Promise<AnalyticsSummaryResponse>;
  getReferenceVersions(): Promise<ReferenceVersionsResponse>;
}
