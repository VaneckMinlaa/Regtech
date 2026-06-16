import { ArrowRightLeft, Calculator, Scale, Sparkles } from "lucide-react";

/** Flèche décorative (curseur) des badges hero d'origine. */
const POINTER_PATH =
  "M2.892 12.494L0.093 2.038C-0.34 0.837 0.81-0.33 2.017 0.086L12.656 2.751C14.578 3.413 14.738 6.07 12.908 6.957L11.777 7.506C9.9 8.416 8.392 9.942 7.504 11.829L7.099 12.691C6.234 14.528 3.581 14.404 2.892 12.494Z";

const BADGES = [
  {
    label: "Droits & taxes",
    icon: Calculator,
    color: "#8D79FF",
    bg: "rgba(141, 121, 255, 0.1)",
    className: "absolute top-14 left-16 floating-1",
    pointerClassName: "absolute -bottom-2 -right-1 rotate-[135deg]",
  },
  {
    label: "Code HS",
    icon: Sparkles,
    color: "#29AEFF",
    bg: "rgba(41, 174, 255, 0.1)",
    className: "absolute left-[145px] top-[298px] floating-2 max-[1240px]:left-[80px]",
    pointerClassName: "absolute -top-2 -right-1 -rotate-45",
  },
  {
    label: "ZLECAf",
    icon: Scale,
    color: "#FF745E",
    bg: "rgba(255, 116, 94, 0.1)",
    className: "absolute right-16 top-[108px] floating-3",
    pointerClassName: "absolute -bottom-2 -left-1 rotate-45",
  },
  {
    label: "Comparer",
    icon: ArrowRightLeft,
    color: "#FFB128",
    bg: "rgba(255, 177, 40, 0.1)",
    className: "absolute top-[316px] right-[200px] floating-4 max-[1240px]:right-[80px]",
    pointerClassName: "absolute -top-2 -left-1 -rotate-[135deg]",
  },
] as const;

function BadgePointer({ color, className }: { color: string; className: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path d={POINTER_PATH} fill={color} />
    </svg>
  );
}

export function HeroFloatingBadges() {
  return (
    <div className="max-[1100px]:hidden pointer-events-none">
      {BADGES.map(({ label, icon: Icon, color, bg, className, pointerClassName }) => (
        <div key={label} className={`relative ${className}`}>
          <div
            className="flex items-center gap-2.5 rounded-full border border-white/10 px-4 py-2.5 shadow-lg backdrop-blur-sm"
            style={{ backgroundColor: bg }}
          >
            <span
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full shadow-md"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${color}, ${color}99)`,
                boxShadow: `0 4px 12px ${color}40`,
              }}
            >
              <Icon className="size-4 text-white" strokeWidth={2.25} aria-hidden />
            </span>
            <span className="text-sm font-semibold whitespace-nowrap" style={{ color }}>
              {label}
            </span>
          </div>
          <BadgePointer color={color} className={pointerClassName} />
        </div>
      ))}
    </div>
  );
}
