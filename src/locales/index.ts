import { en } from "./en";
import { ar } from "./ar";

export type Locale = "en" | "ar";
export type Direction = "ltr" | "rtl";

export type TranslationSchema = typeof en;

export const locales: Record<Locale, TranslationSchema> = {
  en,
  ar,
};

export const defaultLocale: Locale = "ar";

/**
 * Formats a dotted key into a clean readable fallback label (e.g. 'shipment.fields.fullName' -> 'Full Name')
 */
function createSafeFallback(path: string): string {
  const parts = path.split(".");
  const lastPart = parts[parts.length - 1] || path;
  // Convert camelCase or kebab-case to Title Case
  const words = lastPart
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Nested key translation helper:
 * resolves strings like "home.hero.title" with optional param interpolation.
 * NEVER displays raw dot-notation keys on the UI.
 */
export function getTranslationValue(
  locale: Locale,
  path: string,
  params?: Record<string, string | number>
): string {
  const dict = locales[locale] || locales.en;
  const keys = path.split(".");

  let current: any = dict;
  let found = true;

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      found = false;
      break;
    }
  }

  // If not found in current locale, fallback to English dictionary
  if (!found || typeof current !== "string") {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[i18n] Missing translation key: "${path}" in locale "${locale}".`);
    }

    let fallbackCurrent: any = locales.en;
    let fallbackFound = true;
    for (const fk of keys) {
      if (fallbackCurrent && typeof fallbackCurrent === "object" && fk in fallbackCurrent) {
        fallbackCurrent = fallbackCurrent[fk];
      } else {
        fallbackFound = false;
        break;
      }
    }

    if (fallbackFound && typeof fallbackCurrent === "string") {
      current = fallbackCurrent;
    } else {
      // Safe human-readable fallback: Never show raw key with dots to the customer
      current = createSafeFallback(path);
    }
  }

  if (typeof current !== "string") {
    current = createSafeFallback(path);
  }

  if (!params) {
    return current;
  }

  let result = current;
  for (const [paramKey, paramVal] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramVal));
  }

  return result;
}

