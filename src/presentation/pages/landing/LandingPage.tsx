import { LandingFooter } from "./components/LandingFooter";
import { LandingHeader } from "./components/LandingHeader";
import { BenefitsGridSection } from "./sections/BenefitsGridSection";
import { CoreFeaturesSection } from "./sections/CoreFeaturesSection";
import { FaqSection } from "./sections/FaqSection";
import { HeroSection } from "./sections/HeroSection";
import { PricingSection } from "./sections/PricingSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { ToolsTabSection } from "./sections/ToolsTabSection";
import { useTheme } from "@/presentation/providers/ThemeProvider";
import "./landing.css";

interface LandingPageProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

export function LandingPage({ onSignIn, onGetStarted }: LandingPageProps) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`landing-page flex flex-col flex-1 min-h-screen ${
        darkMode
          ? "bg-[#101828]"
          : "bg-gradient-to-b from-[#F0F4FF] via-white to-white"
      }`}
    >
      <LandingHeader onSignIn={onSignIn} onGetStarted={onGetStarted} />
      <div className="isolate flex-1 flex flex-col">
        <HeroSection onGetStarted={onGetStarted} />
        <CoreFeaturesSection />
        <ToolsTabSection onGetStarted={onGetStarted} />
        <BenefitsGridSection onGetStarted={onGetStarted} />
        <TestimonialsSection />
        <PricingSection onGetStarted={onGetStarted} />
        <FaqSection />
      </div>
      <LandingFooter onSignIn={onSignIn} onGetStarted={onGetStarted} />
    </div>
  );
}
