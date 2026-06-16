import React, { useEffect, useState } from "react";
import { Database } from "lucide-react";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import type { ReferenceVersionsResponse } from "@/infrastructure/http/regtechApiTypes";

interface ReferenceVersionsFooterProps {
  darkMode?: boolean;
}

/** Versions référentiels (`GET /monetization/reference-versions`). */
export function ReferenceVersionsFooter({ darkMode = true }: ReferenceVersionsFooterProps) {
  const [versions, setVersions] = useState<ReferenceVersionsResponse | null>(null);

  useEffect(() => {
    void regtechApi.getReferenceVersions().then(setVersions).catch(() => undefined);
  }, []);

  if (!versions) return null;

  return (
    <div
      className={`mt-6 pt-4 border-t text-[9px] font-mono space-y-1 ${
        darkMode ? "border-gray-800 text-gray-600" : "border-gray-200 text-gray-500"
      }`}
      id="reference_versions_footer"
    >
      <p className="flex items-center gap-1 font-bold uppercase tracking-wider">
        <Database className="w-3 h-3" />
        Reference versions (F-24)
      </p>
      <p>TEC CEMAC : {versions.tecCemac}</p>
      <p>Moteur ZLECAf : {versions.zlecafTariffEngine}</p>
      <p>Catalogue HS : {versions.hsCatalogue}</p>
      <p>VAT Africa : {versions.africaVatRates} · Engine {versions.engineVersion}</p>
    </div>
  );
}
