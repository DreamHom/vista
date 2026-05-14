/**
 * Landing-page translations.
 *
 * SCOPE: this file covers ONLY the public landing page. Inner routes
 * (`/listings`, `/dashboard`, `/haven`) stay English for now, capstone
 * scope. When we want full i18n we'll either lift these dictionaries up
 * or move to a library (next-intl is the likely landing spot).
 *
 * QUALITY: English is canonical and reviewed. Yorùbá / Igbo / Hausa
 * translations are best-effort and should be reviewed by a native
 * speaker before going live. Where idiom is risky the translation
 * preserves meaning over literalism, e.g. "make dreams come true"
 * becomes a phrase about *delivering* dreams rather than the surface
 * dream verb. Diacritics included where they matter for tone.
 *
 *   ⚠️ TODO: native review for yo / ig / ha.
 */

import type { LocaleCode } from "../i18n";

export interface Dictionary {
  hero: {
    nav: {
      rent: string;
      buy: string;
      commercial: string;
      discover: string;
    };
    headline: string;
    headlineAccent: string;
    country: string;
  };
  listingsPreview: {
    title: string;
    supporting: string;
    seeAll: string;
    filters: {
      all: string;
      rent: string;
      sale: string;
      commercial: string;
      apartment: string;
      house: string;
      villa: string;
      shortlet: string;
      land: string;
    };
  };
  valueProp: {
    steps: readonly { title: string; body: string }[];
  };
  shorts: {
    eyebrow: string;
    topics: readonly string[];
    featuredCaption: string;
    viewsLabel: string;
  };
  featured: {
    eyebrow: string;
    reviews: string;
    viewListing: string;
  };
  services: {
    title: string;
    detailsLabel: string;
    detailsBody: string;
    servicesLabel: string;
    items: readonly { title: string; body: string }[];
  };
  footer: {
    blurb: string;
    qrDownload: { title: string; subtitle: string };
    qrInfo: { title: string; subtitle: string };
    phoneLabel: string;
    addressLabel: string;
    rightsReserved: string;
  };
  listingTypes: {
    APARTMENT: string;
    HOUSE: string;
    VILLA: string;
    COMMERCIAL: string;
  };
  perYear: string;
}

const en: Dictionary = {
  hero: {
    nav: {
      rent: "Rent",
      buy: "Buy",
      commercial: "Commercial",
      discover: "Discover",
    },
    headline: "Making dreams come true,",
    headlineAccent: "one home at a time.",
    country: "Nigeria",
  },
  listingsPreview: {
    title: "Find your ideal home, villa or apartment for rent or sale",
    supporting:
      "A curated selection of properties across Lagos and Abuja, hand-picked for their photography, paperwork, and people.",
    seeAll: "See all",
    filters: {
      all: "All",
      rent: "Rent",
      sale: "Sale",
      commercial: "Commercial",
      apartment: "Apartment",
      house: "House",
      villa: "Villa",
      shortlet: "Shortlet",
      land: "Land",
    },
  },
  valueProp: {
    steps: [
      {
        title: "Browse listings",
        body: "Explore a curated selection of homes across Lagos and Abuja, complete with photos, fees, and verified ownership.",
      },
      {
        title: "Connect with owners",
        body: "Reach out directly to property owners or assigned agents. No middlemen taking unannounced cuts.",
      },
      {
        title: "Schedule a visit",
        body: "Pick an inspection slot that fits your week. We'll confirm with the agent and keep you on the same page.",
      },
      {
        title: "Finalise and secure",
        body: "Submit your offer, negotiate openly on platform, and close with everything documented end to end.",
      },
    ],
  },
  shorts: {
    eyebrow: "Shorts Video",
    topics: [
      "Inside the home",
      "Neighbourhood spotlight",
      "Rental process guide",
      "Owner's insight",
      "Living experience",
    ],
    featuredCaption: "A closer look at your future home",
    viewsLabel: "{n} views",
  },
  featured: {
    eyebrow: "Featured · Entire House",
    reviews: "{n} reviews",
    viewListing: "View this home",
  },
  services: {
    title: "Simplifying everyday routines.",
    detailsLabel: "Details",
    detailsBody:
      "Finding a home shouldn't feel like a gamble. DreamHomes pairs verified inventory with on-platform negotiation. You keep the same information at signing that you had at the first scroll. No off-platform surprises.",
    servicesLabel: "Services",
    items: [
      {
        title: "Verified listings",
        body: "Every property is checked at two layers: owner identity and document chain. Verified badges are earned, not given.",
      },
      {
        title: "Transparent fees",
        body: "Caution, service charge, and agency fees are published up front. Nothing changes between inspection and signing.",
      },
      {
        title: "Trusted inspections",
        body: "Slot-based scheduling, no double-bookings, and a written record of every visit. You always know where your deal stands.",
      },
    ],
  },
  footer: {
    blurb:
      "Find your ideal home, apartment, or commercial space across Nigeria. Explore, rent, buy, and move in transparently.",
    qrDownload: {
      title: "Scan to download",
      subtitle: "Sign up for high-quality properties",
    },
    qrInfo: {
      title: "Scan the QR code",
      subtitle: "Property information at your fingertips",
    },
    phoneLabel: "Phone",
    addressLabel: "Address",
    rightsReserved: "All rights reserved.",
  },
  listingTypes: {
    APARTMENT: "Apartment",
    HOUSE: "House",
    VILLA: "Villa",
    COMMERCIAL: "Commercial",
  },
  perYear: "/year",
};

const yo: Dictionary = {
  hero: {
    nav: {
      rent: "Háyà",
      buy: "Rà",
      commercial: "Òwò",
      discover: "Wádìí",
    },
    headline: "Ńfi àlá rọ̀ di òtítọ́,",
    headlineAccent: "ilé kọ̀ọ̀kan ní àkókò kọ̀ọ̀kan.",
    country: "Nàìjíríà",
  },
  listingsPreview: {
    title: "Wá ilé, fílà tàbí yàrá tó dára jùlọ fún ìháyà tàbí ìrà",
    supporting:
      "Àkójọ àwọn ohun ìní tó dára jákèjádò Èkó àti Abúja, tí a ti yan ní pẹ̀lẹ́pẹ̀lẹ̀ fún àwòrán wọn, ìwé wọn, àti àwọn ènìyàn tó wà nínú wọn.",
    seeAll: "Wo gbogbo rẹ̀",
    filters: {
      all: "Gbogbo rẹ̀",
      rent: "Háyà",
      sale: "Ìtà",
      commercial: "Òwò",
      apartment: "Yàrá",
      house: "Ilé",
      villa: "Fílà",
      shortlet: "Háyà kúkúrú",
      land: "Ilẹ̀",
    },
  },
  valueProp: {
    steps: [
      {
        title: "Wo àwọn ohun ìní",
        body: "Yẹ àkójọ àwọn ilé tí a ti yan jákèjádò Èkó àti Abúja, pẹ̀lú àwòrán, owó, àti ìwé tí a ti fọwọ́sí.",
      },
      {
        title: "Bá olówó ní ìbátan",
        body: "Bá olówó ohun ìní tàbí aṣojú rẹ̀ sọ̀rọ̀ tààrà. Kò sí alárínà tó ń fi owó pamọ́.",
      },
      {
        title: "Yan àkókò ìbẹ̀wò",
        body: "Yan àkókò ìbẹ̀wò tó bá àkókò rẹ mu. A ó jẹ́ kí aṣojú mọ̀, a ó sì jẹ́ kí gbogbo wa wà lójú kannáà.",
      },
      {
        title: "Parí, kí o sì gba ilé",
        body: "Fi ìfilọ̀lé rẹ ránṣẹ́, jíròrò ní ojúkojú lórí ẹ̀rọ wa, kí o sì parí pẹ̀lú ìwé pípé.",
      },
    ],
  },
  shorts: {
    eyebrow: "Fídíò Kúkúrú",
    topics: [
      "Inú ilé",
      "Ìtàn àdúgbò",
      "Ìtọ́nisọ́nà ìháyà",
      "Ìmọ̀ olówó",
      "Ìrírí ìgbé ayé",
    ],
    featuredCaption: "Wo ilé ọjọ́ iwájú rẹ ní jíjinlẹ̀",
    viewsLabel: "{n} ìwò",
  },
  featured: {
    eyebrow: "Àyànfẹ́ · Ilé Pípé",
    reviews: "{n} àyẹ̀wò",
    viewListing: "Wo ilé yìí",
  },
  services: {
    title: "Ńṣe àwọn nǹkan ojoojúmọ́ rọrùn.",
    detailsLabel: "Àlàyé",
    detailsBody:
      "Wíwá ilé kò gbọdọ̀ dàbí èrè-tàbí-pàdánù. DreamHomes da àwọn ohun ìní tí a ti fọwọ́sí pọ̀ pẹ̀lú ìjíròrò lórí ẹ̀rọ. Ìròyìn kannáà nígbà fífọwọ́sí gẹ́gẹ́ bí o ti rí níbi àkọ́kọ́. Kò sí ìyàlẹ́nu lẹ́yìn-òde-ẹ̀rọ.",
    servicesLabel: "Àwọn Iṣẹ́",
    items: [
      {
        title: "Ohun ìní tí a ti fọwọ́sí",
        body: "A ń ṣàyẹ̀wò gbogbo ohun ìní ní ẹ̀yà méjì: ìdánimọ̀ olówó àti ìwé. Àmì ìfọwọ́sí ni a fi ń sin ènìyàn, kì í ṣe ọfẹ́.",
      },
      {
        title: "Owó tó hàn jáde",
        body: "Owó ìpamọ́, owó iṣẹ́, àti owó aṣojú ni a tẹ̀ jáde láti ìbẹ̀rẹ̀. Kò sí nǹkan tó ń yí padà láàrin ìbẹ̀wò àti àdéhùn.",
      },
      {
        title: "Ìbẹ̀wò tó dájú",
        body: "Ètò àkókò, kò sí ìpadàbọ̀ méjì, ìwé fún gbogbo ìbẹ̀wò. O máa ń mọ̀ ibi tí ọ̀rọ̀ rẹ wà.",
      },
    ],
  },
  footer: {
    blurb:
      "Wá ilé, yàrá, tàbí ààyè òwò tó bá ọ ní Nàìjíríà. Ṣàwárí, háyà, rà, kí o sì wọlé pẹ̀lú ìṣòótọ́.",
    qrDownload: {
      title: "Ya àwòrán láti gba",
      subtitle: "Forúkọ sílẹ̀ fún àwọn ohun ìní tó dára",
    },
    qrInfo: {
      title: "Ya àwòrán QR yìí",
      subtitle: "Ìròyìn ohun ìní lórí ọwọ́ rẹ",
    },
    phoneLabel: "Tẹlifóònù",
    addressLabel: "Àdírẹ́sì",
    rightsReserved: "Gbogbo ẹ̀tọ́ wà ní ìpamọ́.",
  },
  listingTypes: {
    APARTMENT: "Yàrá",
    HOUSE: "Ilé",
    VILLA: "Fílà",
    COMMERCIAL: "Òwò",
  },
  perYear: "/ọdún",
};

const ig: Dictionary = {
  hero: {
    nav: {
      rent: "Mgbazinye",
      buy: "Zụta",
      commercial: "Azụmaahịa",
      discover: "Chọpụta",
    },
    headline: "Na-eme ka nrọ mezuo,",
    headlineAccent: "otu ụlọ n'oge ọ bụla.",
    country: "Naịjirịa",
  },
  listingsPreview: {
    title: "Chọta ụlọ, vịla, ma ọ bụ apartmenti maka mgbazinye ma ọ bụ ire",
    supporting:
      "Nhọrọ ahaziri ahazi nke akụrụngwa na Eko na Abuja, ahọpụtara maka foto ha, akwụkwọ ha, na ndị mmadụ.",
    seeAll: "Hụ ihe niile",
    filters: {
      all: "Niile",
      rent: "Mgbazinye",
      sale: "Ire",
      commercial: "Azụmaahịa",
      apartment: "Apartmenti",
      house: "Ụlọ",
      villa: "Vịla",
      shortlet: "Mgbazinye obere",
      land: "Ala",
    },
  },
  valueProp: {
    steps: [
      {
        title: "Lelee ndepụta",
        body: "Chọgharịa nhọrọ ahaziri ahazi nke ụlọ na Eko na Abuja, yana foto, ụgwọ, na nweta a kwadoro.",
      },
      {
        title: "Soro ndị nwe akpa",
        body: "Kpọtụrụ ndị nwe ihe onwunwe ma ọ bụ ndị nnọchi anya kpọmkwem. Onweghị onye ọkà na-ewere ihe na nzuzo.",
      },
      {
        title: "Hazie nlele",
        body: "Họrọ oge nlele dabara n'izu gị. Anyị ga-akwado ya na onye nnọchi anya ma mee ka mmadụ niile mara ihe na-eme.",
      },
      {
        title: "Mechaa ma chekwaa",
        body: "Nyefee ọrụ gị, kparịta ụka n'elu nyiwe a, ma mechie ihe niile na akwụkwọ doro anya.",
      },
    ],
  },
  shorts: {
    eyebrow: "Vidiyo Mkpụmkpụ",
    topics: [
      "N'ime ụlọ",
      "Mkpọchi mpaghara",
      "Nduzi mgbazinye",
      "Echiche onye nwe",
      "Ahụmahụ ibi ndụ",
    ],
    featuredCaption: "Lekwasị ụlọ ọdịnihu gị anya nke ọma",
    viewsLabel: "{n} nlele",
  },
  featured: {
    eyebrow: "A họrọ · Ụlọ Dum",
    reviews: "{n} nyochaa",
    viewListing: "Lee ụlọ a",
  },
  services: {
    title: "Mee omume kwa ụbọchị ka ọ dị mfe.",
    detailsLabel: "Nkọwa",
    detailsBody:
      "Ịchọta ụlọ ekwesịghị ịdị ka egwuregwu ihe ize ndụ. DreamHomes na-ejikọ ihe onwunwe a kwadoro na mkparịta ụka n'elu nyiwe. Ọ bụ otu ozi mgbe a na-akwado, dị ka ị hụrụ na mbụ. Onweghị ihe ijuanya na-eme na mpụga.",
    servicesLabel: "Ọrụ",
    items: [
      {
        title: "Ndepụta a kwadoro",
        body: "A na-enyocha akụrụngwa ọ bụla na nrụgide abụọ: njirimara onye nwe na ụzọ akwụkwọ. A na-erite akara a kwadoro, ọ bụghị enye n'efu.",
      },
      {
        title: "Ụgwọ doro anya",
        body: "A na-ebipụta ụgwọ nlebanya, ụgwọ ọrụ, na ụgwọ ndị nnọchi anya site na mmalite. Onweghị ihe ọzọ na-agbanwe n'etiti nyocha na ịbịnye aka.",
      },
      {
        title: "Nyocha a tụkwasịrị obi",
        body: "Ndokwa oge oge, enweghị nkenke abụọ, na ndekọ akwụkwọ maka nleta ọ bụla. Ị maara ebe nkwekọrịta gị nọ.",
      },
    ],
  },
  footer: {
    blurb:
      "Chọta ụlọ, apartmenti, ma ọ bụ ohere azụmaahịa na Naịjirịa. Chọgharịa, kwụrụ ụgwọ, zụta, ma banye n'ime na nghọta.",
    qrDownload: {
      title: "Pịa iji budata",
      subtitle: "Debanye aha maka akụrụngwa dị elu",
    },
    qrInfo: {
      title: "Pịa koodu QR",
      subtitle: "Ozi akụrụngwa na mkpịsị aka gị",
    },
    phoneLabel: "Ekwentị",
    addressLabel: "Adreesị",
    rightsReserved: "Ikike niile e debere.",
  },
  listingTypes: {
    APARTMENT: "Apartmenti",
    HOUSE: "Ụlọ",
    VILLA: "Vịla",
    COMMERCIAL: "Azụmaahịa",
  },
  perYear: "/afọ",
};

const ha: Dictionary = {
  hero: {
    nav: {
      rent: "Haya",
      buy: "Sayi",
      commercial: "Kasuwanci",
      discover: "Gano",
    },
    headline: "Cika mafarki,",
    headlineAccent: "gida ɗaya a kowane lokaci.",
    country: "Najeriya",
  },
  listingsPreview: {
    title: "Nemo gidan da kake so, fili ko ɗaki don haya ko siyarwa",
    supporting:
      "Zaɓaɓɓun kadarori a Legas da Abuja, an zaɓo su saboda hotunan su, takardun mallakar su, da mutanen da ke bayansu.",
    seeAll: "Duba duka",
    filters: {
      all: "Duka",
      rent: "Haya",
      sale: "Sayarwa",
      commercial: "Kasuwanci",
      apartment: "Ɗaki",
      house: "Gida",
      villa: "Fili",
      shortlet: "Haya gajere",
      land: "Ƙasa",
    },
  },
  valueProp: {
    steps: [
      {
        title: "Bincika jeri",
        body: "Bincika zaɓaɓɓun gidaje a Legas da Abuja, tare da hotuna, kuɗi, da mallakar da aka tabbatar.",
      },
      {
        title: "Tuntuɓi masu mallaka",
        body: "Tuntuɓi masu mallakar kadarori ko wakilai kai tsaye. Babu masu shiga tsakani da ke ɗaukar kuɗi a ɓoye.",
      },
      {
        title: "Tsara ziyara",
        body: "Zaɓi lokacin ziyara da ya dace da makonnka. Za mu tabbatar da shi tare da wakilin kuma mu sa kowa ya san abin da ke faruwa.",
      },
      {
        title: "Kammala kuma ka tabbatar",
        body: "Aika tayinka, yi shawarwari a kan dandali, ka rufe yarjejeniya tare da takardu cikakku.",
      },
    ],
  },
  shorts: {
    eyebrow: "Bidiyon Gajere",
    topics: [
      "Cikin gidan",
      "Maraba unguwa",
      "Jagorar haya",
      "Hangen mai mallaka",
      "Kwarewar zama",
    ],
    featuredCaption: "Duba gidan nan gabanka da kyau",
    viewsLabel: "Ra'ayoyi {n}",
  },
  featured: {
    eyebrow: "Zaɓaɓɓe · Gida Cikakke",
    reviews: "Ra'ayoyi {n}",
    viewListing: "Duba wannan gidan",
  },
  services: {
    title: "Sauƙaƙe ayyukan yau da kullum.",
    detailsLabel: "Bayanai",
    detailsBody:
      "Neman gida bai kamata ya kasance kamar caca ba. DreamHomes na haɗa kadarorin da aka tabbatar tare da shawarwari a kan dandali. Sami bayani iri ɗaya lokacin sa hannu kamar yadda ka gani da farko. Babu mamaki a waje.",
    servicesLabel: "Ayyuka",
    items: [
      {
        title: "Jerin da aka tabbatar",
        body: "Ana bincika kowane kadara a matakai biyu: sanin mai mallaka da sarƙar takardu. Alamomin tabbatarwa ana samun su, ba a ba su ba.",
      },
      {
        title: "Kuɗaɗen bayyane",
        body: "Kuɗin ajiya, kuɗin sabis, da kuɗin wakili ana wallafa su tun farko. Babu canji tsakanin ziyara da sa hannu.",
      },
      {
        title: "Ziyara mai dogaro",
        body: "Tsarin lokaci, babu rufewa biyu, da rikodin rubutu ga kowane ziyara. Kullum ka san inda yarjejeniyarka take.",
      },
    ],
  },
  footer: {
    blurb:
      "Nemo gidanka mai kyau, ɗaki, ko sararin kasuwanci a Najeriya. Bincika, yi haya, sayi, kuma shiga cikin gaskiya.",
    qrDownload: {
      title: "Tafiyar da don zazzagewa",
      subtitle: "Yi rajista don kadarori masu inganci",
    },
    qrInfo: {
      title: "Tafiyar da lambar QR",
      subtitle: "Bayanan kadara a hannunka",
    },
    phoneLabel: "Wayar tarho",
    addressLabel: "Adireshi",
    rightsReserved: "Duk haƙƙoƙin an kiyaye.",
  },
  listingTypes: {
    APARTMENT: "Ɗaki",
    HOUSE: "Gida",
    VILLA: "Fili",
    COMMERCIAL: "Kasuwanci",
  },
  perYear: "/shekara",
};

export const DICTIONARIES: Record<LocaleCode, Dictionary> = { en, yo, ig, ha };

/**
 * Interpolate `{token}` placeholders in a translated string.
 *
 *   interpolate("Hello, {name}", { name: "Amaka" })  // "Hello, Amaka"
 */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in values ? String(values[key]) : `{${key}}`,
  );
}
