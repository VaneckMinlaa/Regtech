import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DynamicLogo } from "@/presentation/components/brand/DynamicLogo";
import { landingEase } from "@/presentation/pages/landing/motion/landingMotion";

interface LandingIntroSplashProps {
  darkMode?: boolean;
  /** When true, plays exit animation then calls onFinished. */
  exit?: boolean;
  onFinished?: () => void;
}

export function LandingIntroSplash({
  darkMode = true,
  exit = false,
  onFinished,
}: LandingIntroSplashProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!exit) return;
    setShow(false);
  }, [exit]);

  return (
    <AnimatePresence onExitComplete={onFinished}>
      {show && (
        <motion.div
          key="landing-intro-splash"
          className={`landing-intro-splash fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden ${
            darkMode ? "bg-[#101828]" : "bg-gradient-to-b from-[#F0F4FF] to-white"
          }`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.55, ease: landingEase }}
          aria-busy={!exit}
          aria-label="Loading RegTech"
        >
          <div className="landing-intro-orb landing-intro-orb-a" aria-hidden />
          <div className="landing-intro-orb landing-intro-orb-b" aria-hidden />
          <div className="landing-intro-orb landing-intro-orb-c" aria-hidden />

          <motion.div
            className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: landingEase }}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
            >
              <DynamicLogo size="lg" darkMode={darkMode} />
            </motion.div>

            <div className="space-y-2">
              <motion.h1
                className={`text-2xl font-bold font-display tracking-tight sm:text-3xl ${
                  darkMode ? "text-white/95" : "text-gray-900"
                }`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease: landingEase }}
              >
                RegTech
              </motion.h1>
              <motion.p
                className={`text-sm sm:text-base ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.5, ease: landingEase }}
              >
                AfCFTA customs intelligence for African trade
              </motion.p>
            </div>

            <motion.div
              className="landing-intro-progress mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/10 sm:w-56"
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <motion.div
                className="landing-intro-progress-bar h-full rounded-full"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.1,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
