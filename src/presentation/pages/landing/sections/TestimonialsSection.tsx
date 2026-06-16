import { useState } from "react";
import { TESTIMONIALS } from "../data/landingContent";

export function TestimonialsSection() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? TESTIMONIALS : TESTIMONIALS.slice(0, 6);

  return (
    <section className="md:py-28 py-14 relative bg-white dark:bg-dark-primary">
      <div className="wrapper">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="mb-3 font-bold text-center text-gray-800 text-3xl dark:text-white/90 md:text-title-lg">
            What our users say
          </h2>
          <p className="max-w-xl mx-auto leading-6 text-gray-500 dark:text-gray-400">
            SMEs, freight forwarders, and exporters use RegTech to secure their daily customs operations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 max-w-[72rem] mx-auto">
          {visible.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-2 bg-gray-50 dark:bg-white/5 dark:border-gray-800 border rounded-[20px] border-gray-100 hover:border-primary-200 transition"
            >
              <div className="flex items-center p-3 mb-3 bg-white/90 dark:bg-white/[0.03] rounded-2xl">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={52}
                  height={52}
                  className="size-13 object-cover ring-2 ring-white dark:ring-gray-700 mr-4 rounded-full"
                />
                <div>
                  <h3 className="text-gray-800 dark:text-white/90">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.company}</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/90 dark:bg-white/[0.03]">
                <p className="text-base leading-6 text-gray-700 dark:text-gray-400">{testimonial.testimonial}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center relative z-10">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 px-6 py-3.5 text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded-full shadow-theme-xs hover:bg-gray-50"
          >
            {showAll ? "Show less" : "Show more"}
          </button>
        </div>
      </div>

      {!showAll && <div className="white-gradient h-[264px] w-full absolute bottom-0 pointer-events-none" />}
    </section>
  );
}
