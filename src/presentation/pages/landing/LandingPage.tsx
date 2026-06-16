import { motion } from "motion/react";
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
import { landingEase } from "./motion/landingMotion";
import "./landing.css";

interface LandingPageProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  /** True once intro splash has faded — triggers hero entrance. */
  entranceReady?: boolean;
}

export function LandingPage({
  onSignIn,
  onGetStarted,
  entranceReady = true,
}: LandingPageProps) {
  const { darkMode } = useTheme();

  return (
    <motion.div
      className={`landing-page flex flex-col flex-1 min-h-screen ${
        darkMode
          ? "bg-[#101828]"
          : "bg-gradient-to-b from-[#F0F4FF] via-white to-white"
      }`}
      initial={{ opacity: entranceReady ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: landingEase, delay: entranceReady ? 0 : 0.15 }}
    >
      <LandingHeader onSignIn={onSignIn} onGetStarted={onGetStarted} animate={entranceReady} />
      <div className="isolate flex-1 flex flex-col">
        <HeroSection onGetStarted={onGetStarted} animate={entranceReady} />
        <CoreFeaturesSection />
        <ToolsTabSection onGetStarted={onGetStarted} />
        <BenefitsGridSection onGetStarted={onGetStarted} />
        <TestimonialsSection />
        <PricingSection onGetStarted={onGetStarted} />
        <FaqSection />
      </div>
      <LandingFooter onSignIn={onSignIn} onGetStarted={onGetStarted} />
    </motion.div>
  );
}
