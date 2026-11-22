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

  // Trip story
  tripStory: string
  soFar: string
  postTripNudge: (tripName: string) => string
  statLived: string
  statSurprises: string
  statGhosts: string
  statAhead: string
  howItFelt: string
  planVsReality: string
  planned: string
  spent: string
  acrossPlans: (n: number) => string
  surprisesAdded: (amount: number) => string
  noMoney: string
  highlight: string
  biggestSurprise: string
  seenDifferently: string
  plansThatStayed: string
  whoToldIt: string
  storyEmpty: string
}

const en: Translations = {
  appTagline: 'Your trips, two sides to every story.',
  helloPrefix: 'Hello, ',
  newTrip: '+ New Trip',
  demoLabel: 'Demo',

  daysSouls: (d, s) => `${d} ${d === 1 ? 'day' : 'days'}, ${s} ${s === 1 ? 'soul' : 'souls'}`,
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

  tripStory: '📖 Trip story',
  soFar: 'So far',
  postTripNudge: (name) => `${name} is done. Some moments are still unrecorded.`,
  statLived: 'lived',
  statSurprises: 'surprises',
  statGhosts: 'stayed plans',
  statAhead: 'still ahead',
  howItFelt: 'HOW IT FELT',
  planVsReality: 'PLAN VS REALITY',
  planned: 'Planned',
  spent: 'Spent',
  acrossPlans: (n) => (n === 1 ? 'per person, 1 plan compared' : `per person, ${n} plans compared`),
  surprisesAdded: (a) => `Surprises added ~${a}€ each`,
  noMoney: 'Log a few costs to compare the plan with reality.',
  highlight: 'THE HIGHLIGHT',
  biggestSurprise: 'BIGGEST SURPRISE',
  seenDifferently: 'SEEN DIFFERENTLY',
  plansThatStayed: 'PLANS THAT STAYED PLANS',
  whoToldIt: 'WHO TOLD THE STORY',
  storyEmpty: 'Nothing lived yet. The story starts with the first moment.',
}

const es: Translations = {
  appTagline: 'Tus viajes, dos lados de cada historia.',
  helloPrefix: 'Hola, ',
  newTrip: '+ Nuevo viaje',
  demoLabel: 'Demo',

  daysSouls: (d, s) => `${d} ${d === 1 ? 'día' : 'días'}, ${s} ${s === 1 ? 'alma' : 'almas'}`,
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

  tripStory: '📖 Historia del viaje',
  soFar: 'Hasta ahora',
  postTripNudge: (name) => `${name} terminó. Algunos momentos siguen sin contarse.`,
  statLived: 'vividos',
  statSurprises: 'sorpresas',
  statGhosts: 'solo planes',
  statAhead: 'por venir',
  howItFelt: 'CÓMO SE SINTIÓ',
  planVsReality: 'PLAN VS REALIDAD',
  planned: 'Planeado',
  spent: 'Gastado',
  acrossPlans: (n) => (n === 1 ? 'por persona, 1 plan comparado' : `por persona, ${n} planes comparados`),
  surprisesAdded: (a) => `Las sorpresas sumaron ~${a}€ cada uno`,
  noMoney: 'Anota algunos gastos para comparar el plan con la realidad.',
  highlight: 'LO MEJOR',
  biggestSurprise: 'LA GRAN SORPRESA',
  seenDifferently: 'VISTO DISTINTO',
  plansThatStayed: 'PLANES QUE QUEDARON EN PLANES',
  whoToldIt: 'QUIÉN LO CONTÓ',
  storyEmpty: 'Aún no hay nada vivido. La historia empieza con el primer momento.',
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

  tripStory: '📖 Seyahat hikâyesi',
  soFar: 'Şimdiye kadar',
  postTripNudge: (name) => `${name} bitti. Bazı anlar hâlâ yazılmadı.`,
  statLived: 'yaşandı',
  statSurprises: 'sürpriz',
  statGhosts: 'plan kaldı',
  statAhead: 'sırada',
  howItFelt: 'NASIL HİSSETTİRDİ',
  planVsReality: 'PLAN VE GERÇEK',
  planned: 'Planlanan',
  spent: 'Harcanan',
  acrossPlans: (n) => `kişi başı, ${n} plan karşılaştırıldı`,
  surprisesAdded: (a) => `Sürprizler kişi başı ~${a}€ ekledi`,
  noMoney: 'Planı gerçekle karşılaştırmak için birkaç tutar gir.',
  highlight: 'EN GÜZEL AN',
  biggestSurprise: 'EN BÜYÜK SÜRPRİZ',
  seenDifferently: 'FARKLI YAŞANANLAR',
  plansThatStayed: 'PLANDA KALANLAR',
  whoToldIt: 'HİKÂYEYİ KİM ANLATTI',
  storyEmpty: 'Henüz yaşanan bir şey yok. Hikâye ilk anla başlıyor.',
}

const DICTIONARIES: Record<Locale, Translations> = { en, es, tr }

export function useT(): Translations {
  const locale = useLocaleStore((s) => s.locale)
  return DICTIONARIES[locale]
}
