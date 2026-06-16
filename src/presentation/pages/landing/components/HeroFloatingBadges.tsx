import { ArrowRightLeft, Calculator, Scale, Sparkles } from "lucide-react";

const BADGES = [
  {
    label: "Droits & taxes",
    icon: Calculator,
    color: "#8D79FF",
    bg: "rgba(141, 121, 255, 0.1)",
    className: "absolute top-14 left-16 floating-1",
  },
  {
    label: "Code HS",
    icon: Sparkles,
    color: "#29AEFF",
    bg: "rgba(41, 174, 255, 0.1)",
    className: "absolute left-[145px] top-[298px] floating-2 max-[1240px]:left-[80px]",
  },
  {
    label: "ZLECAf",
    icon: Scale,
    color: "#FF745E",
    bg: "rgba(255, 116, 94, 0.1)",
    className: "absolute right-16 top-[108px] floating-3",
  },
  {
    label: "Comparer",
    icon: ArrowRightLeft,
    color: "#FFB128",
    bg: "rgba(255, 177, 40, 0.1)",
    className: "absolute top-[316px] right-[200px] floating-4 max-[1240px]:right-[80px]",
  },
] as const;

export function HeroFloatingBadges() {
  return (
    <div className="max-[1100px]:hidden pointer-events-none">
      {BADGES.map(({ label, icon: Icon, color, bg, className }) => (
        <div
          key={label}
          className={`flex items-center gap-2.5 rounded-full border border-white/10 px-4 py-2.5 shadow-lg backdrop-blur-sm ${className}`}
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
      ))}
    </div>
  );
}
