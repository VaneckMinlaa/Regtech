import { motion } from "motion/react";
import { Stars } from "../components/Stars";
import { ThemeImage } from "../components/ThemeImage";
import { LandingStagger, LandingStaggerItem } from "../components/LandingReveal";
import {
  fadeUp,
  heroImage,
  landingTransition,
  scaleIn,
  staggerContainer,
} from "../motion/landingMotion";

interface HeroSectionProps {
  onGetStarted: () => void;
  animate?: boolean;
}

function Subheading({ text }: { text: string }) {
  return (
    <div className="rounded-full mb-6 max-w-fit mx-auto bg-linear-to-r from-[#FF58D580] to-[#4E6EFF80] p-0.5">
      <div className="bg-white dark:bg-dark-primary py-2 text-sm items-center gap-2 px-5 inline-flex text-gray-700 dark:text-white/90 rounded-full">
        <Stars />
        <p>{text}</p>
      </div>
    </div>
  );
}

export function HeroSection({ onGetStarted, animate = true }: HeroSectionProps) {
  return (
    <section className="pt-16 relative overflow-hidden bg-gradient-to-b from-[#F0F4FF] via-white to-white dark:from-[#171F2E] dark:via-[#171F2E] dark:to-[#171F2E]">
      <div className="max-w-[120rem] mx-auto relative">
        <div className="wrapper">
          <div className="max-w-[800px] mx-auto">
            <motion.div
              className="text-center pb-16"
              initial="hidden"
              animate={animate ? "visible" : "hidden"}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} transition={landingTransition(0.55, 0)}>
                <Subheading text="AfCFTA customs assistant for African SMEs" />
              </motion.div>

              <motion.h1
                variants={fadeUp}
                transition={landingTransition(0.6, 0.05)}
                className="text-gray-800 mx-auto font-bold mb-4 text-4xl sm:text-[50px] dark:text-white/90 sm:leading-[64px] max-w-[700px]"
              >
                Simplify your customs operations with AfCFTA intelligence
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={landingTransition(0.6, 0.1)}
                className="max-w-[537px] text-center mx-auto text-gray-600 dark:text-gray-400 text-base"
              >
                Simulate duties and taxes, verify AfCFTA eligibility, classify your products, and compare multiple
                destinations — pay your subscription with Mobile Money via PawaPay.
              </motion.p>

              <motion.div
                variants={scaleIn}
                transition={landingTransition(0.5, 0.15)}
                className="mt-9 flex sm:flex-row flex-col gap-3 relative z-30 items-center justify-center"
              >
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="bg-primary-500 transition h-12 inline-flex items-center justify-center hover:bg-primary-600 px-6 py-3 rounded-full text-white text-sm"
                >
                  Access the application
                </button>

                <a
                  href="#tools"
                  className="rounded-full flex h-12 gap-3 items-center text-sm border bg-white dark:bg-white/10 border-gray-200 dark:border-white/[0.05] text-gray-700 dark:text-white p-1.5 pr-6"
                >
                  <span className="size-9 rounded-full gradient-bg-two inline-flex items-center justify-center text-sm font-medium">
                    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M3.5 3.71077L3.5 12.3482C3.5 13.5211 4.78545 14.2402 5.78489 13.6265L12.8183 9.30776C13.7717 8.7223 13.7717 7.33672 12.8183 6.75125L5.7849 2.43251C4.78545 1.81882 3.5 2.53795 3.5 3.71077Z"
                        fill="white"
                      />
                    </svg>
                  </span>
                  View the demo
                </a>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="max-w-[1000px] mx-auto relative"
            initial="hidden"
            animate={animate ? "visible" : "hidden"}
            variants={heroImage}
            transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: 1200 }}
          >
            <div className="p-3 sm:p-[18px] relative z-30 rounded-[32px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/10 shadow-theme-sm">
              <ThemeImage
                lightSrc="/landing/hero/hero-img.jpg"
                darkSrc="/landing/hero/hero-img-dark.png"
                alt="Interface RegTech"
                className="w-full rounded-2xl"
              />
            </div>
            <div className="absolute hidden lg:block z-10 -top-20 -translate-y-20 left-1/2 -translate-x-1/2 pointer-events-none opacity-80 dark:opacity-100">
              <svg width="1300" height="1001" viewBox="0 0 1300 1001" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.7" filter="url(#filter0_f_hero)">
                  <circle cx="800" cy="500.03" r="300" fill="#4E6EFF" />
                </g>
                <g opacity="0.3" filter="url(#filter1_f_hero)">
                  <circle cx="500" cy="500.03" r="300" fill="#FF58D5" />
                </g>
                <defs>
                  <filter id="filter0_f_hero" x="300" y="0.029541" width="1000" height="1000" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feGaussianBlur stdDeviation="100" />
                  </filter>
                  <filter id="filter1_f_hero" x="0" y="0.029541" width="1000" height="1000" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feGaussianBlur stdDeviation="100" />
                  </filter>
                </defs>
              </svg>
            </div>
          </motion.div>
        </div>

        <div className="max-[1100px]:hidden pointer-events-none">
          <img src="/landing/hero/shape-left-1.svg" className="absolute top-14 left-16 floating-1" alt="" />
          <img src="/landing/hero/shape-left-2.svg" className="absolute left-[145px] top-[298px] floating-2 max-[1240px]:left-[80px]" alt="" />
          <img src="/landing/hero/shape-right-1.svg" className="absolute right-16 top-[108px] floating-3" alt="" />
          <img src="/landing/hero/shape-right-2.svg" className="absolute top-[316px] right-[200px] floating-4 max-[1240px]:right-[80px]" alt="" />
        </div>
      </div>
      <div className="hero-glow-bg pointer-events-none w-full h-167.5 absolute z-10 bottom-0" />

      <div className="wrapper">
        <LandingStagger className="max-w-[1016px] relative z-30 mx-auto pt-14 pb-16" fast immediate>
          <LandingStaggerItem>
            <p className="text-center text-gray-500 dark:text-white/50 text-lg font-medium">
              Built for economic operators across Africa
            </p>
          </LandingStaggerItem>
          <LandingStaggerItem>
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 mt-10">
              {["CEMAC", "UEMOA", "AfCFTA", "HS Code", "Mobile Money", "PawaPay"].map((label) => (
                <span
                  key={label}
                  className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition ${
                    label === "PawaPay"
                      ? "bg-primary-500/10 text-primary-600 ring-1 ring-primary-500/30 dark:text-primary-300"
                      : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-white/50"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </LandingStaggerItem>
        </LandingStagger>
      </div>
    </section>
  );
}
