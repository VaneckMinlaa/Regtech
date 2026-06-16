import { HeroFloatingBadges } from "../components/HeroFloatingBadges";
import { Stars } from "../components/Stars";
import { ThemeImage } from "../components/ThemeImage";

interface HeroSectionProps {
  onGetStarted: () => void;
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

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="pt-16 relative overflow-hidden bg-gradient-to-b from-[#F0F4FF] via-white to-white dark:from-[#171F2E] dark:via-[#171F2E] dark:to-[#171F2E]">
      <div className="max-w-[120rem] mx-auto relative">
        <div className="wrapper">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center pb-16">
              <Subheading text="L'assistant douanier AfCFTA pour les PME africaines" />

              <h1 className="text-gray-800 mx-auto font-bold mb-4 text-4xl sm:text-[50px] dark:text-white/90 sm:leading-[64px] max-w-[700px]">
                Simplifiez vos opérations douanières avec l&apos;intelligence AfCFTA
              </h1>
              <p className="max-w-[537px] text-center mx-auto text-gray-600 dark:text-gray-400 text-base">
                Simulez droits et taxes, vérifiez l&apos;éligibilité ZLECAf, classifiez vos produits et comparez
                plusieurs destinations — le tout dans un espace de travail unifié.
              </p>

              <div className="mt-9 flex sm:flex-row flex-col gap-3 relative z-30 items-center justify-center">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="bg-primary-500 transition h-12 inline-flex items-center justify-center hover:bg-primary-600 px-6 py-3 rounded-full text-white text-sm"
                >
                  Accéder à l&apos;application
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
                  Voir la démo
                </a>
              </div>
            </div>
          </div>
          <div className="max-w-[1000px] mx-auto relative">
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
          </div>
        </div>

        <HeroFloatingBadges />
      </div>
      <div className="hero-glow-bg pointer-events-none w-full h-167.5 absolute z-10 bottom-0" />

      <div className="wrapper">
        <div className="max-w-[1016px] relative z-30 mx-auto pt-14 pb-16">
          <p className="text-center text-gray-500 dark:text-white/50 text-lg font-medium">
            Pensé pour les opérateurs économiques du continent africain
          </p>
          <div className="flex flex-wrap justify-center items-center gap-7 md:gap-14 mt-10">
            {["CEMAC", "UEMOA", "AfCFTA", "ZLECAf", "HS Code", "Mobile Money", "PawaPay"].map((label) => (
              <span
                key={label}
                className="text-gray-400 dark:text-white/40 text-sm font-semibold tracking-wide uppercase opacity-80 hover:opacity-100 transition"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
