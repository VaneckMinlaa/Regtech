import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { FAQ_ITEMS } from "../data/landingContent";

export function FaqSection() {
  const [activeItem, setActiveItem] = useState<number | null>(1);

  return (
    <section id="faq" className="py-14 md:py-28 bg-white dark:bg-[#171f2e]">
      <div className="wrapper">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="mb-3 font-bold text-center text-gray-800 text-3xl dark:text-white/90 md:text-title-lg">
            Frequently asked questions
          </h2>
          <p className="max-w-md mx-auto leading-6 text-gray-500 dark:text-gray-400">
            Everything you need to know before running your first RegTech simulation.
          </p>
        </div>
        <div className="max-w-[600px] mx-auto space-y-4">
          {FAQ_ITEMS.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <div key={item.id} className="pb-5 border-b border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setActiveItem(isActive ? null : item.id)}
                  aria-expanded={isActive}
                >
                  <span className="text-lg font-medium text-gray-800 dark:text-white/90">{item.question}</span>
                  <span className="shrink-0 ml-6 text-gray-500">
                    {isActive ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </span>
                </button>
                {isActive && (
                  <div className="mt-5">
                    <p className="text-base leading-7 text-gray-500 dark:text-gray-400">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
