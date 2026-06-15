import React from "react";
import { BatchLoader } from "@/presentation/features/export/BatchLoader";

interface BatchPageProps {
  darkMode?: boolean;
  onUpgrade: () => void;
}

export function BatchPage({ darkMode = true, onUpgrade }: BatchPageProps) {
  return (
    <div className="space-y-6 animate-fadeIn font-sans" id="batch_page">
      <BatchLoader darkMode={darkMode} onUpgrade={onUpgrade} />
    </div>
  );
}
