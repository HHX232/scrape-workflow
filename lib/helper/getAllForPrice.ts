const UNIT_MAP: Record<string, string> = {
  // English keys
  mg: "миллиграмм",
  g: "грамм",
  kg: "килограмм",
  c: "центнер",
  t: "тонна",
  ml: "миллилитр",
  l: "литр",
  hl: "гектолитр",
  m3: "метр³",
  m2: "метр²",
  cm2: "сантиметр²",
  pcs: "штука",
  pack: "упаковка",
  m: "метр",
  cm: "сантиметр",
  pair: "пара",
  set: "комплект",
  box: "коробка",
  bag: "мешок",
  // Russian keys
  мг: "миллиграмм",
  г: "грамм",
  гр: "грамм",
  кг: "килограмм",
  кило: "килограмм",
  килограмм: "килограмм",
  ц: "центнер",
  центнер: "центнер",
  т: "тонна",
  тонна: "тонна",
  тонн: "тонна",
  мл: "миллилитр",
  л: "литр",
  литр: "литр",
  гл: "гектолитр",
  м: "метр",
  см: "сантиметр",
  м3: "метр³",
  м2: "метр²",
  см2: "сантиметр²",
  шт: "штука",
  штука: "штука",
  штук: "штука",
  уп: "упаковка",
  упак: "упаковка",
  упаковка: "упаковка",
  пар: "пара",
  пара: "пара",
  компл: "комплект",
  комплект: "комплект",
  кор: "коробка",
  коробка: "коробка",
  меш: "мешок",
  мешок: "мешок",
};

function parseUnit(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/[.\s]/g, "");
  return UNIT_MAP[key] ?? raw.trim();
}

function parsePrice(raw: string): number {
  const cleaned = raw.trim().replace(/\s/g, "").replace(",", ".");
  const match = cleaned.match(/[\d]+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

function parseCurrency(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (/рубл|руб|₽|^р\.?$/.test(s)) return "RUB";
  if (/доллар|\$|usd|dollar/.test(s)) return "USD";
  if (/евро|€|eur|euro/.test(s)) return "EUR";
  if (/юань|cny|yuan/.test(s)) return "CNY";
  const upper = raw.trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(upper)) return upper;
  return upper;
}

export type PriceResult = {
  price: {
    value: number;
    currency: string;
    unit: string;
  };
  value: number;
  currency: string;
  unit: string;
};

export function getAllForPrice(
  unitStr: string,
  priceStr: string,
  currencyStr: string
): PriceResult {
  const value = parsePrice(priceStr);
  const currency = parseCurrency(currencyStr);
  const unit = parseUnit(unitStr);

  return {
    price: { value, currency, unit },
    value,
    currency,
    unit,
  };
}
