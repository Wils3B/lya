import { Direction } from '../entities/direction.enum'

export interface LocaleSeedEntry {
  code: string
  name: string
  nativeName: string
  direction: Direction
}

/**
 * Curated seed list of supported locales (BCP 47).
 * To add new locales in the future, simply append entries here — the seeder
 * will upsert them on the next application startup.
 */
export const LOCALES_SEED: LocaleSeedEntry[] = [
  // — Arabic (RTL)
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: Direction.RTL },
  {
    code: 'ar-SA',
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية (المملكة العربية السعودية)',
    direction: Direction.RTL,
  },
  { code: 'ar-EG', name: 'Arabic (Egypt)', nativeName: 'العربية (مصر)', direction: Direction.RTL },

  // — Persian / Farsi (RTL)
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: Direction.RTL },

  // — Hebrew (RTL)
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', direction: Direction.RTL },

  // — Urdu (RTL)
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: Direction.RTL },

  // — Bulgarian
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', direction: Direction.LTR },

  // — Chinese
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: Direction.LTR },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文 (简体)', direction: Direction.LTR },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文 (繁體)', direction: Direction.LTR },

  // — Croatian
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', direction: Direction.LTR },

  // — Czech
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', direction: Direction.LTR },

  // — Danish
  { code: 'da', name: 'Danish', nativeName: 'Dansk', direction: Direction.LTR },

  // — Dutch
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', direction: Direction.LTR },
  { code: 'nl-BE', name: 'Dutch (Belgium)', nativeName: 'Nederlands (België)', direction: Direction.LTR },

  // — English
  { code: 'en', name: 'English', nativeName: 'English', direction: Direction.LTR },
  { code: 'en-US', name: 'English (United States)', nativeName: 'English (United States)', direction: Direction.LTR },
  { code: 'en-GB', name: 'English (United Kingdom)', nativeName: 'English (United Kingdom)', direction: Direction.LTR },
  { code: 'en-AU', name: 'English (Australia)', nativeName: 'English (Australia)', direction: Direction.LTR },
  { code: 'en-CA', name: 'English (Canada)', nativeName: 'English (Canada)', direction: Direction.LTR },

  // — Finnish
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', direction: Direction.LTR },

  // — French
  { code: 'fr', name: 'French', nativeName: 'Français', direction: Direction.LTR },
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français (France)', direction: Direction.LTR },
  { code: 'fr-BE', name: 'French (Belgium)', nativeName: 'Français (Belgique)', direction: Direction.LTR },
  { code: 'fr-CA', name: 'French (Canada)', nativeName: 'Français (Canada)', direction: Direction.LTR },
  { code: 'fr-CH', name: 'French (Switzerland)', nativeName: 'Français (Suisse)', direction: Direction.LTR },

  // — German
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: Direction.LTR },
  { code: 'de-DE', name: 'German (Germany)', nativeName: 'Deutsch (Deutschland)', direction: Direction.LTR },
  { code: 'de-AT', name: 'German (Austria)', nativeName: 'Deutsch (Österreich)', direction: Direction.LTR },
  { code: 'de-CH', name: 'German (Switzerland)', nativeName: 'Deutsch (Schweiz)', direction: Direction.LTR },

  // — Greek
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', direction: Direction.LTR },

  // — Hungarian
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', direction: Direction.LTR },

  // — Indonesian
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: Direction.LTR },

  // — Italian
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: Direction.LTR },
  { code: 'it-IT', name: 'Italian (Italy)', nativeName: 'Italiano (Italia)', direction: Direction.LTR },

  // — Japanese
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: Direction.LTR },

  // — Korean
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: Direction.LTR },

  // — Malay
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', direction: Direction.LTR },

  // — Norwegian
  { code: 'nb', name: 'Norwegian Bokmål', nativeName: 'Norsk bokmål', direction: Direction.LTR },

  // — Polish
  { code: 'pl', name: 'Polish', nativeName: 'Polski', direction: Direction.LTR },

  // — Portuguese
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: Direction.LTR },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', direction: Direction.LTR },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', direction: Direction.LTR },

  // — Romanian
  { code: 'ro', name: 'Romanian', nativeName: 'Română', direction: Direction.LTR },

  // — Russian
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: Direction.LTR },

  // — Slovak
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', direction: Direction.LTR },

  // — Spanish
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: Direction.LTR },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', direction: Direction.LTR },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', direction: Direction.LTR },
  { code: 'es-AR', name: 'Spanish (Argentina)', nativeName: 'Español (Argentina)', direction: Direction.LTR },

  // — Swedish
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', direction: Direction.LTR },

  // — Thai
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย', direction: Direction.LTR },

  // — Turkish
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: Direction.LTR },

  // — Ukrainian
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', direction: Direction.LTR },

  // — Vietnamese
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: Direction.LTR },
]
