import type { Country, HSProduct, SimulationResult } from "@/domain/reference/types";
import type {
  BatchPayload,
  BatchResponse,
  ClassifyPayload,
  ClassifyResult,
  SimulatePayload,
} from "@/infrastructure/http/regtechApi";

export interface RegTechApiPort {
  getCountries(options?: {
    pilotOnly?: boolean;
    africaOnly?: boolean;
  }): Promise<Country[]>;
  getTariffs(options?: { catalog?: "afcfta" }): Promise<HSProduct[]>;
  simulate(payload: SimulatePayload): Promise<SimulationResult>;
  classify(payload: ClassifyPayload): Promise<ClassifyResult>;
  batch(payload: BatchPayload): Promise<BatchResponse>;
}
