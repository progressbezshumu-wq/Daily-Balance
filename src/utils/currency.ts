export type Currency =
  | "EUR"
  | "USD"
  | "UAH"
  | "GBP"
  | "CHF"
  | "PLN"
  | "CZK"
  | "SEK"
  | "NOK"
  | "DKK"
  | "HUF"
  | "RON"
  | "CNY";

export const SUPPORTED_CURRENCIES: Currency[] = [
  "EUR",
  "USD",
  "UAH",
  "GBP",
  "CHF",
  "PLN",
  "CZK",
  "SEK",
  "NOK",
  "DKK",
  "HUF",
  "RON",
  "CNY",
];

const FALLBACK_RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  UAH: 43,
  GBP: 0.85,
  CHF: 0.96,
  PLN: 4.30,
  CZK: 25.0,
  SEK: 11.0,
  NOK: 11.0,
  DKK: 7.45,
  HUF: 390.0,
  RON: 4.97,
  CNY: 7.80,
};

let cachedRates: Record<Currency, number> | null = null;
let cachedAt = 0;
const CACHE_MS = 1000 * 60 * 30;

export async function fetchLiveRates(): Promise<Record<Currency, number>> {
  const now = Date.now();

  if (cachedRates && now - cachedAt < CACHE_MS) {
    return cachedRates;
  }

  try {
    const response = await fetch("https://api.exchangerate.host/latest?base=EUR");
    const data = await response.json();

    const result: Record<Currency, number> = { ...FALLBACK_RATES };

    for (const currency of SUPPORTED_CURRENCIES) {
      if (currency === "EUR") {
        result.EUR = 1;
        continue;
      }

      const raw = data?.rates?.[currency];
      const rate = raw != null ? Number(raw) : NaN;

      result[currency] = Number.isFinite(rate) && rate > 0 ? rate : FALLBACK_RATES[currency];
    }

    cachedRates = result;
    cachedAt = now;
    return result;
  } catch {
    cachedRates = { ...FALLBACK_RATES };
    cachedAt = now;
    return cachedRates;
  }
}

export async function convertCurrency(
  value: number,
  from: string,
  to: string
): Promise<number> {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;

  const fromCode = String(from || "EUR").toUpperCase() as Currency;
  const toCode = String(to || "EUR").toUpperCase() as Currency;

  if (fromCode === toCode) return amount;

  const rates = await fetchLiveRates();

  const fromRate = rates[fromCode] ?? 1;
  const toRate = rates[toCode] ?? 1;

  const eurValue = fromCode === "EUR" ? amount : amount / fromRate;
  return toCode === "EUR" ? eurValue : eurValue * toRate;
}

export function convertCurrencySync(
  value: number,
  from: string,
  to: string
): number {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;

  const fromCode = String(from || "EUR").toUpperCase() as Currency;
  const toCode = String(to || "EUR").toUpperCase() as Currency;

  if (fromCode === toCode) return amount;

  const rates = cachedRates ?? FALLBACK_RATES;

  const fromRate = rates[fromCode] ?? 1;
  const toRate = rates[toCode] ?? 1;

  const eurValue = fromCode === "EUR" ? amount : amount / fromRate;
  return toCode === "EUR" ? eurValue : eurValue * toRate;
}
