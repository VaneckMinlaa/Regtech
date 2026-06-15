/** Calendrier indicatif de reduction tarifaire AfCFTA (affichage AFT). */
export const AFCFTA_SCHEDULES: Record<number, { reduction: number; label: string }> = {
  2025: { reduction: 0.0, label: "Hors AfCFTA (base)" },
  2026: { reduction: 0.75, label: "AfCFTA phase I (-75 %)" },
  2027: { reduction: 0.8, label: "AfCFTA phase II (-80 %)" },
  2028: { reduction: 0.85, label: "AfCFTA phase III (-85 %)" },
  2029: { reduction: 0.9, label: "AfCFTA phase IV (-90 %)" },
  2030: { reduction: 1.0, label: "AfCFTA liberation (-100 %)" },
};
