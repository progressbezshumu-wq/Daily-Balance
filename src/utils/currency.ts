export const SUPPORTED_CURRENCIES = [
  "USD","EUR","JPY","GBP","CHF","CNY","CAD","AUD","NZD","SEK",
  "NOK","DKK","PLN","CZK","HUF","RON","BGN","TRY","UAH","RUB",
  "INR","BRL","MXN","ARS","CLP","COP","PEN","ZAR","EGP","MAD",
  "NGN","KES","GHS","AED","SAR","QAR","KWD","BHD","OMR","ILS",
  "SGD","HKD","KRW","TWD","THB","MYR","IDR","PHP","VND","PKR"
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_BASE_CURRENCY: SupportedCurrency = "EUR";

type RatesResponse = {
  success?: boolean;
  quotes?: Record<string, number>;
};

const FALLBACK_RATES: Record<SupportedCurrency, number> = {
  USD: 1.1,
  EUR: 1,
  JPY: 161,
  GBP: 0.86,
  CHF: 0.96,
  CNY: 7.9,
  CAD: 1.48,
  AUD: 1.67,
  NZD: 1.8,
  SEK: 11.2,
  NOK: 11.5,
  DKK: 7.46,
  PLN: 4.3,
  CZK: 25.2,
  HUF: 395,
  RON: 4.97,
  BGN: 1.96,
  TRY: 38,
  UAH: 42,
  RUB: 101,
  INR: 91,
  BRL: 6.0,
  MXN: 18.5,
  ARS: 1160,
  CLP: 1030,
  COP: 4300,
  PEN: 4.1,
  ZAR: 20.4,
  EGP: 53,
  MAD: 10.8,
  NGN: 1750,
  KES: 145,
  GHS: 17,
  AED: 4.04,
  SAR: 4.13,
  QAR: 4.0,
  KWD: 0.34,
  BHD: 0.41,
  OMR: 0.42,
  ILS: 4.0,
  SGD: 1.46,
  HKD: 8.6,
  KRW: 1480,
  TWD: 35.5,
  THB: 39,
  MYR: 5.2,
  IDR: 17800,
  PHP: 63,
  VND: 27200,
  PKR: 308
};

export async function fetchLiveRates(): Promise<Record<SupportedCurrency, number>> {
  try {
    const currencies = SUPPORTED_CURRENCIES.join(",");
    const response = await fetch(
      `https://api.exchangerate.host/live?source=EUR&currencies=${currencies}`
    );

    const data = (await response.json()) as RatesResponse;

    const result = {} as Record<SupportedCurrency, number>;

    for (const currency of SUPPORTED_CURRENCIES) {
      if (currency === "EUR") {
        result[currency] = 1;
        continue;
      }

      const quote = Number(data?.quotes?.[`EUR${currency}`]);
      result[currency] = Number.isFinite(quote) ? quote : FALLBACK_RATES[currency];
    }

    result.EUR = 1;
    return result;
  } catch {
    return FALLBACK_RATES;
  }
}

export function convertCurrency(
  value: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
  rates: Record<SupportedCurrency, number>
) {
  const fromRate = rates[from] ?? 1;
  const toRate = rates[to] ?? 1;

  const valueInEur = value / fromRate;
  return valueInEur * toRate;
}
