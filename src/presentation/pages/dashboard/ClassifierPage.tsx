import React from "react";
import { IntelligentClassifier } from "@/presentation/features/classification/IntelligentClassifier";

interface ClassifierPageProps {
  darkMode?: boolean;
  onSelectHSCode: (code: string, desc: string) => void;
  onUpgrade: () => void;
}

export function ClassifierPage({ darkMode = true, onSelectHSCode, onUpgrade }: ClassifierPageProps) {
  return (
    <div className="space-y-6 animate-fadeIn" id="classifier_page">
      <IntelligentClassifier
        onSelectHSCode={onSelectHSCode}
        darkMode={darkMode}
        onUpgrade={onUpgrade}
      />
    </div>
  );
}
