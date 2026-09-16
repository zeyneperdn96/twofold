import { useLocaleStore } from '@/store/locale'

export type Locale = 'en' | 'es' | 'tr'

export const LOCALES: Locale[] = ['en', 'es', 'tr']

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  tr: 'TR',
}

export interface Translations {
  // App-wide
  appTagline: string
  helloPrefix: string
  newTrip: string
  demoLabel: string

  // Trip header
  daysSouls: (days: number, souls: number) => string
  live: string
  livedAwaiting: (lived: number, awaiting: number) => string
  addMomentToDay: (day: number) => string

  // Activity card labels
  weHopedFor: string
  weHopeFor: string
  whatHappened: string
  howWasItReally: string
  tellTheStory: string
  unplannedBadge: string
  surprise: string
  perPerson: string
  someone: string

  // Voice count and verdict pills
  voices: (count: number) => string
  pillMore: string
  pillSame: string
  pillLess: string

  // Empty states / prompts
  emptyDay: string
  ghostCard: string
  logExperience: string
  addActivity: string
}

const en: Translations = {
  appTagline: 'Your trips, two sides to every story.',
  helloPrefix: 'Hello, ',
  newTrip: '+ New Trip',
  demoLabel: 'Demo',

  daysSouls: (d, s) => `${d} days, ${s} souls`,
  live: 'Live',
  livedAwaiting: (l, a) => `${l} lived · ${a} awaiting`,
  addMomentToDay: (n) => `+ Add a moment to Day ${n}`,

  weHopedFor: 'WE HOPED FOR',
  weHopeFor: 'WE HOPE FOR',
  whatHappened: 'WHAT HAPPENED',
  howWasItReally: 'once it happens, how did it go?',
  tellTheStory: 'Tell the story →',
  unplannedBadge: '✦ UNPLANNED ✦',
  surprise: 'SURPRISE',
  perPerson: 'per person',
  someone: 'Someone',

  voices: (n) => (n === 1 ? '1 voice' : `${n} voices`),
  pillMore: 'WOW',
  pillSame: 'AS HOPED',
  pillLess: 'MEH',

  emptyDay: 'This day is still unwritten.',
  ghostCard: 'You planned this. Did it happen?',
  logExperience: 'How did it actually go?',
  addActivity: 'What are you hoping for?',
}

const es: Translations = {
  appTagline: 'Tus viajes, dos lados de cada historia.',
  helloPrefix: 'Hola, ',
  newTrip: '+ Nuevo viaje',
  demoLabel: 'Demo',

  daysSouls: (d, s) => `${d} días, ${s} almas`,
  live: 'En vivo',
  livedAwaiting: (l, a) => `${l} vividos · ${a} pendientes`,
  addMomentToDay: (n) => `+ Añadir un momento al Día ${n}`,

  weHopedFor: 'LO QUE ESPERÁBAMOS',
  weHopeFor: 'LO QUE ESPERAMOS',
  whatHappened: 'LO QUE PASÓ',
  howWasItReally: 'cuando pase, ¿cómo fue?',
  tellTheStory: 'Cuenta la historia →',
  unplannedBadge: '✦ INESPERADO ✦',
  surprise: 'SORPRESA',
  perPerson: 'por persona',
  someone: 'Alguien',

  voices: (n) => (n === 1 ? '1 voz' : `${n} voces`),
  pillMore: 'WOW',
  pillSame: 'COMO ESPERABA',
  pillLess: 'NAH',

  emptyDay: 'Este día sigue sin escribirse.',
  ghostCard: 'Lo planeaste. ¿Pasó?',
  logExperience: '¿Cómo fue de verdad?',
  addActivity: '¿Qué esperas?',
}

const tr: Translations = {
  appTagline: 'Seyahatlerin, her hikâyenin iki yüzü.',
  helloPrefix: 'Merhaba, ',
  newTrip: '+ Yeni Seyahat',
  demoLabel: 'Demo',

  daysSouls: (d, s) => `${d} gün, ${s} ruh`,
  live: 'Canlı',
  livedAwaiting: (l, a) => `${l} yaşandı · ${a} bekliyor`,
  addMomentToDay: (n) => `+ ${n}. güne an ekle`,

  weHopedFor: 'UMDUĞUMUZ',
  weHopeFor: 'UMUYORUZ',
  whatHappened: 'NE OLDU',
  howWasItReally: 'yaşanınca, nasıl geçti?',
  tellTheStory: 'Hikâyeyi anlat →',
  unplannedBadge: '✦ PLANSIZ ✦',
  surprise: 'SÜRPRİZ',
  perPerson: 'kişi başı',
  someone: 'Biri',

  voices: (n) => `${n} ses`,
  pillMore: 'VAY',
  pillSame: 'BEKLENDİĞİ GİBİ',
  pillLess: 'EH',

  emptyDay: 'Bu gün hâlâ yazılmamış.',
  ghostCard: 'Bunu planlamıştın. Oldu mu?',
  logExperience: 'Aslında nasıl geçti?',
  addActivity: 'Ne umuyorsun?',
}

const DICTIONARIES: Record<Locale, Translations> = { en, es, tr }

export function useT(): Translations {
  const locale = useLocaleStore((s) => s.locale)
  return DICTIONARIES[locale]
}
