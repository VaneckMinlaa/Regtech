import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface SearchableSelectOption {
  value: string;
  label: string;
  /** Texte supplementaire pour la recherche (code, categorie, etc.) */
  keywords?: string;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

interface SearchableSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  darkMode?: boolean;
  /** Liste courte : `<select>` natif si false et options < seuil */
  alwaysSearchable?: boolean;
  /** Utilise `<select>` natif uniquement si alwaysSearchable=false et length < seuil */
  searchableThreshold?: number;
  emptyMessage?: string;
  /** Affiche pendant le chargement API (options encore vides) */
  loading?: boolean;
  loadingPlaceholder?: string;
  /** Message si chargement termine mais liste vide */
  noDataPlaceholder?: string;
  className?: string;
  dense?: boolean;
}

export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Search…",
  disabled = false,
  darkMode = true,
  alwaysSearchable = true,
  searchableThreshold = 1,
  emptyMessage = "No results",
  loading = false,
  loadingPlaceholder = "Loading…",
  noDataPlaceholder = "Data unavailable",
  className = "",
  dense = false,
}: SearchableSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const selected = options.find((o) => o.value === value);
  const useSearch =
    alwaysSearchable || options.length >= searchableThreshold;

  const filtered = useMemo(() => {
    if (!useSearch || !query.trim()) return options;
    const q = normalize(query);
    return options.filter((o) => {
      const hay = normalize(`${o.label} ${o.value} ${o.keywords ?? ""}`);
      return hay.includes(q);
    });
  }, [options, query, useSearch]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const inputClass = `w-full rounded-lg pl-9 pr-9 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-colors ${
    dense ? "py-1.5 text-xs" : "py-2.5 text-sm"
  } ${
    darkMode
      ? "bg-[#101828] border border-gray-800 text-gray-100 placeholder:text-gray-500"
      : "bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400"
  }`;

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  const idlePlaceholder = options.length === 0 ? noDataPlaceholder : placeholder;

  if (loading) {
    return (
      <div
        id={id}
        className={`w-full rounded-lg animate-pulse ${
          dense ? "h-8" : "h-10"
        } ${darkMode ? "bg-gray-800/80" : "bg-gray-200"} ${className}`}
        aria-busy="true"
        aria-label={loadingPlaceholder}
      />
    );
  }

  if (!useSearch && options.length > 0) {
    return (
      <select
        id={id}
        value={value}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
        className={`${inputClass} pl-3.5 appearance-none cursor-pointer ${className}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  const isInputDisabled = disabled || loading || options.length === 0;
  const displayValue = open ? query : selected?.label ?? "";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <Search
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
          darkMode ? "text-gray-500" : "text-gray-400"
        }`}
        aria-hidden
      />
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open ? "true" : "false"}
        aria-controls={listId}
        aria-autocomplete="list"
        disabled={isInputDisabled}
        placeholder={idlePlaceholder}
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (!isInputDisabled) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (isInputDisabled) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setHighlight((h) => Math.min(h + 1, Math.max(0, filtered.length - 1)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && filtered[highlight]) {
            e.preventDefault();
            pick(filtered[highlight].value);
          } else if (e.key === "Escape") {
            setOpen(false);
            setQuery("");
          }
        }}
        className={`${inputClass} ${isInputDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Toggle options"
        disabled={isInputDisabled}
        onClick={() => {
          if (isInputDisabled) return;
          setOpen((o) => !o);
          inputRef.current?.focus();
        }}
        className={`absolute right-0 top-0 bottom-0 w-9 flex items-center justify-center ${
          isInputDisabled ? "pointer-events-none" : "cursor-pointer"
        }`}
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            open ? "rotate-180" : ""
          } ${darkMode ? "text-gray-500" : "text-gray-400"}`}
        />
      </button>

      {open && !isInputDisabled && (
        <ul
          id={listId}
          role="listbox"
          className={`absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border shadow-lg ${
            darkMode
              ? "bg-dark-primary border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {filtered.length === 0 ? (
            <li
              className={`px-3 py-2 text-xs ${
                darkMode ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {emptyMessage}
            </li>
          ) : (
            filtered.map((o, i) => (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value ? "true" : "false"}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(o.value)}
                  className={`w-full text-left px-3 py-2 transition-colors ${
                    dense ? "text-xs" : "text-sm"
                  } ${
                    i === highlight || o.value === value
                      ? darkMode
                        ? "bg-primary-500/20 text-primary-300"
                        : "bg-primary-50 text-primary-900"
                      : darkMode
                        ? "text-gray-200 hover:bg-dark-secondary"
                        : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function countryToOptions(
  countries: { code: string; name: string; currency: string }[],
): SearchableSelectOption[] {
  return countries.map((c) => ({
    value: c.code,
    label: `${c.code} — ${c.name} (${c.currency})`,
    keywords: `${c.name} ${c.currency}`,
  }));
}

export function productToOptions(
  products: { code: string; description: string; sensitive?: boolean }[],
): SearchableSelectOption[] {
  return products.map((p) => ({
    value: p.code,
    label: `${p.code} — ${p.description}${p.sensitive ? " (Sensible)" : ""}`,
    keywords: `${p.description} ${p.code}`,
  }));
}
