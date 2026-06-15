import type { RegTechApiPort } from "@/application/ports/RegTechApiPort";
import { regtechApi } from "@/infrastructure/http/regtechApi";

/** Implémentation infrastructure du port API (ADR-002). */
export const httpRegTechRepository: RegTechApiPort = regtechApi;
