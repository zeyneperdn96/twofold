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

  // Trip phases + home
  phasePlanning: string
  phaseReflecting: string
  startsIn: (days: number) => string
  noTrips: string
  resetDemo: string
  deleteTrip: string
  confirmDelete: string
  tripNotFound: string
  backHome: string

  // Two sides
  addYourSide: string
  editYourSide: string
  divergence: (name: string) => string

  // Sheets
  cancel: string
  optional: string
  newTripTitle: string
  tripName: string
  tripNamePlaceholder: string
  firstDay: string
  dayCount: string
  whoIsComing: string
  companionsHint: string
  createTrip: string
  modePlan: string
  modeSurprise: string
  momentTitle: string
  momentPlaceholder: string
  surprisePlaceholder: string
  time: string
  costPerPerson: string
  hopeNotePlaceholder: string
  addToDay: (day: number) => string
  experiencePrompt: string
  yourCost: string
  comparedToHope: string
  saveMySide: string
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

  phasePlanning: 'Upcoming',
  phaseReflecting: 'Memories',
  startsIn: (n) => (n === 1 ? 'Starts tomorrow' : `Starts in ${n} days`),
  noTrips: 'No trips yet. Where to first?',
  resetDemo: 'Reset demo',
  deleteTrip: 'Delete trip',
  confirmDelete: 'Tap again to delete',
  tripNotFound: 'This trip does not exist anymore.',
  backHome: '‹ All trips',

  addYourSide: 'Add your side →',
  editYourSide: 'Edit your side',
  divergence: (name) => `You and ${name} saw this one differently.`,

  cancel: 'Cancel',
  optional: 'optional',
  newTripTitle: 'Where are we going?',
  tripName: 'Trip name',
  tripNamePlaceholder: 'Lisbon in spring',
  firstDay: 'First day',
  dayCount: 'Days',
  whoIsComing: 'Who is coming?',
  companionsHint: 'Names, separated by commas',
  createTrip: 'Create trip',
  modePlan: '💭 Planning it',
  modeSurprise: '✦ It just happened',
  momentTitle: 'What',
  momentPlaceholder: 'Sunset at the old harbour',
  surprisePlaceholder: 'Tiny bakery we walked into',
  time: 'Time',
  costPerPerson: 'Cost per person (€)',
  hopeNotePlaceholder: 'Why it is on the list',
  addToDay: (n) => `Add to Day ${n}`,
  experiencePrompt: 'One sentence. How did it go?',
  yourCost: 'What did it cost you? (€)',
  comparedToHope: 'Compared to what you hoped',
  saveMySide: 'Save my side',
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

  phasePlanning: 'Próximo',
  phaseReflecting: 'Recuerdos',
  startsIn: (n) => (n === 1 ? 'Empieza mañana' : `Empieza en ${n} días`),
  noTrips: 'Aún no hay viajes. ¿Adónde primero?',
  resetDemo: 'Reiniciar demo',
  deleteTrip: 'Eliminar viaje',
  confirmDelete: 'Toca otra vez para eliminar',
  tripNotFound: 'Este viaje ya no existe.',
  backHome: '‹ Todos los viajes',

  addYourSide: 'Añade tu versión →',
  editYourSide: 'Editar tu versión',
  divergence: (name) => `Tú y ${name} lo vivieron distinto.`,

  cancel: 'Cancelar',
  optional: 'opcional',
  newTripTitle: '¿Adónde vamos?',
  tripName: 'Nombre del viaje',
  tripNamePlaceholder: 'Lisboa en primavera',
  firstDay: 'Primer día',
  dayCount: 'Días',
  whoIsComing: '¿Quién viene?',
  companionsHint: 'Nombres, separados por comas',
  createTrip: 'Crear viaje',
  modePlan: '💭 Lo planeamos',
  modeSurprise: '✦ Simplemente pasó',
  momentTitle: 'Qué',
  momentPlaceholder: 'Atardecer en el puerto viejo',
  surprisePlaceholder: 'Una panadería diminuta',
  time: 'Hora',
  costPerPerson: 'Coste por persona (€)',
  hopeNotePlaceholder: 'Por qué está en la lista',
  addToDay: (n) => `Añadir al Día ${n}`,
  experiencePrompt: 'Una frase. ¿Cómo fue?',
  yourCost: '¿Cuánto te costó? (€)',
  comparedToHope: 'Comparado con lo que esperabas',
  saveMySide: 'Guardar mi versión',
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

  phasePlanning: 'Yaklaşıyor',
  phaseReflecting: 'Anılar',
  startsIn: (n) => (n === 1 ? 'Yarın başlıyor' : `${n} gün sonra başlıyor`),
  noTrips: 'Henüz seyahat yok. İlk durak neresi?',
  resetDemo: 'Demoyu sıfırla',
  deleteTrip: 'Seyahati sil',
  confirmDelete: 'Silmek için tekrar dokun',
  tripNotFound: 'Bu seyahat artık yok.',
  backHome: '‹ Tüm seyahatler',

  addYourSide: 'Senin tarafını ekle →',
  editYourSide: 'Tarafını düzenle',
  divergence: (name) => `Sen ve ${name} bunu farklı yaşadınız.`,

  cancel: 'Vazgeç',
  optional: 'isteğe bağlı',
  newTripTitle: 'Nereye gidiyoruz?',
  tripName: 'Seyahat adı',
  tripNamePlaceholder: 'İlkbaharda Lizbon',
  firstDay: 'İlk gün',
  dayCount: 'Gün',
  whoIsComing: 'Kimler geliyor?',
  companionsHint: 'İsimler, virgülle ayrılmış',
  createTrip: 'Seyahati oluştur',
  modePlan: '💭 Planlıyoruz',
  modeSurprise: '✦ Kendiliğinden oldu',
  momentTitle: 'Ne',
  momentPlaceholder: 'Eski limanda gün batımı',
  surprisePlaceholder: 'Girdiğimiz minik fırın',
  time: 'Saat',
  costPerPerson: 'Kişi başı tutar (€)',
  hopeNotePlaceholder: 'Neden listede',
  addToDay: (n) => `${n}. güne ekle`,
  experiencePrompt: 'Tek cümle. Nasıl geçti?',
  yourCost: 'Sana kaça patladı? (€)',
  comparedToHope: 'Umduğuna göre',
  saveMySide: 'Tarafımı kaydet',
}

const DICTIONARIES: Record<Locale, Translations> = { en, es, tr }

export function useT(): Translations {
  const locale = useLocaleStore((s) => s.locale)
  return DICTIONARIES[locale]
}
