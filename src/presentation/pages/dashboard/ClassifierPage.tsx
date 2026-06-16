import React from "react";
import { IntelligentClassifier } from "@/presentation/features/classification/IntelligentClassifier";
import { SectionPanel } from "@/presentation/components/shared/SectionPanel";

interface ClassifierPageProps {
  darkMode?: boolean;
  onSelectHSCode: (code: string, desc: string) => void;
  onUpgrade: () => void;
}

export function ClassifierPage({ darkMode = true, onSelectHSCode, onUpgrade }: ClassifierPageProps) {
  return (
    <div className="animate-fadeIn" id="classifier_page">
      <SectionPanel darkMode={darkMode}>
        <IntelligentClassifier
          onSelectHSCode={onSelectHSCode}
          darkMode={darkMode}
          onUpgrade={onUpgrade}
        />
      </SectionPanel>
    </div>
  );
}
