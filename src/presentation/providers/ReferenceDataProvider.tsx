import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Country, HSProduct } from "@/domain/reference/types";
import { regtechApi, clearReferenceCache } from "@/infrastructure/http/regtechApi";
import { ApiError } from "@/infrastructure/http/apiClient";

interface ReferenceDataState {
  countries: Country[];
  products: HSProduct[];
  isLoading: boolean;
  productsLoading: boolean;
  error: string | null;
  apiOnline: boolean | null;
  reload: () => void;
}

const ReferenceDataContext = createContext<ReferenceDataState | null>(null);

export function ReferenceDataProvider({ children }: { children: React.ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [products, setProducts] = useState<HSProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = () => {
    clearReferenceCache();
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadCountries() {
      setIsLoading(true);
      setError(null);
      try {
        const health = await regtechApi.getHealth().catch(() => null);
        const countryList = await regtechApi.getCountries({ africaOnly: true });
        if (cancelled) return;
        setApiOnline(health?.status === "ok");
        setCountries(countryList);
      } catch (err) {
        if (cancelled) return;
        setApiOnline(false);
        setCountries([]);
        const message =
          err instanceof ApiError
            ? err.message
            : "Unable to load countries from the API. Please verify that the Back-End is running (port 8000).";
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    async function loadProducts() {
      setProductsLoading(true);
      try {
        const productList = await regtechApi.getTariffs().catch(() => [] as HSProduct[]);
        if (!cancelled) setProducts(productList);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }

    void loadCountries();
    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const value = useMemo(
    () => ({
      countries,
      products,
      isLoading,
      productsLoading,
      error,
      apiOnline,
      reload,
    }),
    [countries, products, isLoading, productsLoading, error, apiOnline],
  );

  return (
    <ReferenceDataContext.Provider value={value}>
      {children}
    </ReferenceDataContext.Provider>
  );
}

export function useReferenceData(): ReferenceDataState {
  const ctx = useContext(ReferenceDataContext);
  if (!ctx) {
    throw new Error("useReferenceData must be used inside ReferenceDataProvider");
  }
  return ctx;
}
