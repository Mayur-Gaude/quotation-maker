import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";

const STORAGE_KEY = "quotation_app_prefs_v1";

export const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "Indian Rupee (₹)" },
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "GBP", symbol: "£", label: "British Pound (£)" }
];

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return CURRENCIES[0];
    const parsed = JSON.parse(raw);
    if (parsed?.currencyCode) {
      const row = CURRENCIES.find(c => c.code === parsed.currencyCode);
      if (row) return row;
    }
  } catch {
    /* ignore */
  }
  return CURRENCIES[0];
}

const PreferencesContext = createContext(null);

export const PreferencesProvider = ({ children }) => {
  const [currency, setCurrency] = useState(loadStored);
  const active = currency ?? CURRENCIES[0];

  const setCurrencyByCode = useCallback(code => {
    const row = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
    setCurrency(row);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ currencyCode: row.code })
      );
    } catch {
      /* ignore */
    }
  }, []);

  const formatMoney = useCallback(
    value => {
      const n = Number(value);
      const safe = Number.isFinite(n) ? n : 0;
      return `${active.symbol}${safe.toFixed(2)}`;
    },
    [active.symbol]
  );

  const value = useMemo(
    () => ({
      currencyCode: active.code,
      currencySymbol: active.symbol,
      currencyLabel: active.label,
      setCurrencyByCode,
      formatMoney,
      currencies: CURRENCIES
    }),
    [active, setCurrencyByCode, formatMoney]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return ctx;
};
