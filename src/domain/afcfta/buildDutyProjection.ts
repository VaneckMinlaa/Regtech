import { AFCFTA_SCHEDULES } from "@/domain/reference/afcftaSchedules";
import type { ZlecafDutyResponse } from "@/infrastructure/http/regtechApiTypes";

const PROJECTION_YEARS = [2025, 2026, 2027, 2028, 2029, 2030] as const;

/** Calendrier AfCFTA indicatif 2025–2030 (réduction sur le tarif de base). */
export function buildAfcftaDutyProjection(params: {
  hsCode: string;
  originCountryIso: string;
  initialDutyRate: number;
  sensitive?: boolean;
}): ZlecafDutyResponse[] {
  const { hsCode, originCountryIso, initialDutyRate, sensitive = false } = params;

  return PROJECTION_YEARS.map((year) => {
    const schedule = AFCFTA_SCHEDULES[year];
    const reductionFraction = sensitive ? 0 : schedule.reduction;
    const excluded = sensitive;
    const appliedDutyRate = excluded
      ? initialDutyRate
      : Math.max(0, initialDutyRate * (1 - reductionFraction));

    return {
      hsCode,
      originCountryIso,
      calculationYear: year,
      countryGroup: "NON_PMA",
      productCategory: sensitive ? "SENSITIVE" : "STANDARD",
      transitionStartYear: 2025,
      yearsElapsed: year - 2025,
      initialDutyRate,
      annualReductionRate: reductionFraction,
      reductionFraction,
      appliedDutyRate,
      scheduleYears: PROJECTION_YEARS.length,
      excluded,
      savingsFraction: excluded ? 0 : reductionFraction,
    };
  });
}
