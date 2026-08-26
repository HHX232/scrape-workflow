// Maps any recognized spelling (English short code, English long form, or
// Russian variants/declensions) to the canonical English short code that the
// downstream schema expects (e.g. "kg"). This used to return a Russian
// long-form word instead, which an AI call (563be0f9) then had to translate
// into the short code on every product — now parseUnit does that directly.
const UNIT_MAP: Record<string, string> = {
  // English keys (already canonical)
  mg: "mg", g: "g", kg: "kg", c: "c", t: "t", ml: "ml", l: "l", hl: "hl",
  m3: "m3", m2: "m2", cm2: "cm2", pcs: "pcs", pack: "pack", m: "m", cm: "cm",
  pair: "pair", set: "set", box: "box", bag: "bag",
  // Russian keys
  мг: "mg",
  г: "g",
  гр: "g",
  кг: "kg",
  кило: "kg",
  килограмм: "kg",
  ц: "c",
  центнер: "c",
  т: "t",
  тонна: "t",
  тонн: "t",
  мл: "ml",
  л: "l",
  литр: "l",
  гл: "hl",
  м: "m",
  см: "cm",
  м3: "m3",
  м2: "m2",
  см2: "cm2",
  шт: "pcs",
  штука: "pcs",
  штук: "pcs",
  уп: "pack",
  упак: "pack",
  упаковка: "pack",
  пар: "pair",
  пара: "pair",
  компл: "set",
  комплект: "set",
  кор: "box",
  коробка: "box",
  меш: "bag",
  мешок: "bag",
};

function parseUnit(raw: string): string {
  const normalized = raw.trim().toLowerCase()

  // Прямое совпадение (например "шт", "кг")
  const directKey = normalized.replace(/[.\s]/g, "")
  if (UNIT_MAP[directKey]) return UNIT_MAP[directKey]

  // Ищем известную единицу внутри строки ("от 1 до 40 шт" → "шт")
  let foundKey: string | null = null
  // Сортируем по длине убыванию, чтобы "штука" раньше "шт"
  for (const key of Object.keys(UNIT_MAP).sort((a, b) => b.length - a.length)) {
    if (new RegExp(`(?:^|\\s)${key}(?:\\s|$|\\.)`, 'i').test(normalized)) {
      foundKey = key
      break
    }
  }

  if (!foundKey) return raw.trim()

  // Единица возвращается как чистый код без префикса количества — тот же
  // формат, что раньше отдавал AI-вызов ("от 5 килограмм" → "kg").
  return UNIT_MAP[foundKey]
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
  value: number;
  currency: string;
  unit: string;
};

export function getAllForPrice(
  unitStr: string,
  priceStr: string,
  currencyStr: string
): PriceResult {
  return {
    value: parsePrice(priceStr),
    currency: parseCurrency(currencyStr),
    unit: parseUnit(unitStr),
  };
}
