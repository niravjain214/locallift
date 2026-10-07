/** Dehradun service areas — string matching only, no GPS. */
export const DEHRADUN_AREAS = [
  "Rajpur Road",
  "Mohini Road",
  "Paltan Bazaar",
  "Clement Town",
  "ISBT",
  "Jakhan",
  "Rajendra Nagar",
  "Dalanwala",
  "Karanpur",
  "Chukkuwala",
  "Selakui",
  "Ballupur",
  "Dobra",
  "Sahastradhara Road",
  "Mussoorie Road",
  "Haridwar Road",
  "Shimla Bypass Road",
  "GMS Road",
  "Turner Road",
  "Chakrata Road",
  "Prem Nagar",
  "Other",
] as const;

export type AreaName = (typeof DEHRADUN_AREAS)[number];

export const ELECTRONICS_CATEGORY_GROUPS = [
  {
    slug: "entertainment-electronics",
    label: "Entertainment Electronics",
    icon: "🎮",
    products: [
      "Smart TVs",
      "Gaming Consoles (PlayStation, Xbox)",
      "Home Theatre Systems",
      "Soundbars",
      "Projectors (Movies / Events)",
    ],
  },
  {
    slug: "home-appliances",
    label: "Home Appliances (Electronics)",
    icon: "🏠",
    products: [
      "Refrigerators",
      "Washing Machines",
      "Microwave Ovens",
      "Air Conditioners (AC)",
      "Fan",
      "Air Purifiers",
      "Water Purifiers (RO / UV)",
    ],
  },
  {
    slug: "computing-devices",
    label: "Computing Devices",
    icon: "💻",
    products: [
      "Laptops (Windows / Mac)",
      "Desktop Computers",
      "Tablets / iPads",
      "Workstations (High-Performance PCs)",
      "Chromebooks",
    ],
  },
  {
    slug: "audio-video-equipment",
    label: "Audio & Video Equipment",
    icon: "🎤",
    products: [
      "DSLR / Mirrorless Cameras",
      "Video Cameras / Camcorders",
      "Microphones (Wired / Wireless)",
      "Speakers / PA Systems",
      "DJ Equipment",
      "Mixers & Audio Interfaces",
    ],
  },
  {
    slug: "office-equipment",
    label: "Office Equipment",
    icon: "🖨️",
    products: [
      "Printers (Laser / Inkjet)",
      "Scanners",
      "Photocopiers",
      "Biometric Attendance Machines",
      "Conference Phones",
      "POS Machines",
    ],
  },
  {
    slug: "networking-it",
    label: "Networking & IT Equipment",
    icon: "📡",
    products: [
      "WiFi Routers / Modems",
      "Network Switches",
      "Servers",
      "CCTV Cameras & DVR Systems",
      "LAN Setup Kits",
    ],
  },
  {
    slug: "event-presentation",
    label: "Event & Presentation Equipment",
    icon: "🎉",
    products: [
      "Projectors & Screens",
      "LED Walls / Display Panels",
      "Wireless Mics",
      "Stage Lighting Systems",
      "Teleprompters",
    ],
  },
  {
    slug: "power-misc",
    label: "Power & Misc Electronics",
    icon: "🔋",
    products: [
      "Generators",
      "UPS / Inverters",
      "Power Banks",
      "Extension Boards & Surge Protectors",
    ],
  },
] as const;

export const BROWSE_CATEGORIES = [
  { slug: "all", label: "All" },
  ...ELECTRONICS_CATEGORY_GROUPS.map((g) => ({ slug: g.slug, label: g.label })),
  { slug: "other", label: "Other" },
] as const;

export const APPLIANCE_CATEGORY_OPTIONS = [
  ...ELECTRONICS_CATEGORY_GROUPS.flatMap((g) => g.products),
  "Other",
] as const;

const LEGACY_KEYWORDS_BY_SLUG: Record<string, string[]> = {
  "computing-devices": [
    "laptop",
    "desktop",
    "tablet",
    "ipad",
    "workstation",
    "chromebook",
    "computer",
  ],
  "entertainment-electronics": [
    "smart tv",
    "television",
    "gaming console",
    "playstation",
    "xbox",
    "home theatre",
    "soundbar",
    "projector",
  ],
  "audio-video-equipment": [
    "camera",
    "camcorder",
    "microphone",
    "speaker",
    "pa system",
    "dj",
    "mixer",
    "audio interface",
  ],
  "office-equipment": [
    "printer",
    "scanner",
    "photocopier",
    "biometric",
    "attendance machine",
    "conference phone",
    "pos",
  ],
  "home-appliances": [
    "refrigerator",
    "fridge",
    "washing machine",
    "microwave",
    "air conditioner",
    "ac",
    "air purifier",
    "water purifier",
    "fan",
    "cooler",
    "iron",
    "induction",
    "oven",
    "heater",
  ],
  "networking-it": [
    "router",
    "modem",
    "switch",
    "server",
    "cctv",
    "dvr",
    "lan",
    "network",
  ],
  "event-presentation": [
    "projector",
    "screen",
    "wireless mic",
    "stage light",
    "teleprompter",
    "led wall",
    "display panel",
  ],
  "power-misc": [
    "generator",
    "ups",
    "inverter",
    "power bank",
    "extension board",
    "surge protector",
  ],
};

export function categoryToSlug(category: string): string {
  const c = category.toLowerCase();
  for (const group of ELECTRONICS_CATEGORY_GROUPS) {
    if (group.label.toLowerCase() === c) return group.slug;
    if (group.products.some((p) => p.toLowerCase() === c)) return group.slug;
  }
  for (const [slug, keywords] of Object.entries(LEGACY_KEYWORDS_BY_SLUG)) {
    if (keywords.some((k) => c.includes(k))) return slug;
  }
  return "other";
}

export function matchesBrowseCategory(
  applianceCategory: string,
  filterSlug: string
): boolean {
  if (filterSlug === "all") return true;
  return categoryToSlug(applianceCategory) === filterSlug;
}
