const PRODUCT_IMAGE_KEYWORDS: Array<{ keyword: string; src: string }> = [
  { keyword: "laptop", src: "/product-icons/laptop.png" },
  { keyword: "desktop", src: "/product-icons/monitor.png" },
  { keyword: "workstation", src: "/product-icons/monitor.png" },
  { keyword: "chromebook", src: "/product-icons/laptop.png" },
  { keyword: "tablet", src: "/product-icons/tablet.png" },
  { keyword: "ipad", src: "/product-icons/tablet.png" },
  { keyword: "smart tv", src: "/product-icons/tv.png" },
  { keyword: "gaming console", src: "/product-icons/gaming-console-new.png" },
  { keyword: "playstation", src: "/product-icons/gaming-console-new.png" },
  { keyword: "xbox", src: "/product-icons/gaming-console-new.png" },
  { keyword: "home theatre", src: "/product-icons/speaker-single.png" },
  { keyword: "soundbar", src: "/product-icons/projector.png" },
  { keyword: "projector", src: "/product-icons/speakers-set.png" },
  { keyword: "camera", src: "/product-icons/air-conditioner.png" },
  { keyword: "camcorder", src: "/product-icons/cam.png" },
  { keyword: "microphone", src: "/product-icons/router.png" },
  { keyword: "speaker", src: "/product-icons/wof.png" },
  { keyword: "dj", src: "/product-icons/dj.png" },
  { keyword: "mixer", src: "/product-icons/speaker-single.png" },
  { keyword: "printer", src: "/product-icons/printer.png" },
  { keyword: "scanner", src: "/product-icons/printer.png" },
  { keyword: "photocopier", src: "/product-icons/printer.png" },
  { keyword: "conference", src: "/product-icons/microphone.png" },
  { keyword: "pos", src: "/product-icons/monitor.png" },
  { keyword: "refrigerator", src: "/product-icons/refri.png" },
  { keyword: "washing", src: "/product-icons/air-purifier.png" },
  { keyword: "microwave", src: "/product-icons/oven.png" },
  { keyword: "air conditioner", src: "/product-icons/game-controller.png" },
  { keyword: "air purifier", src: "/product-icons/camera-dslr.png" },
  { keyword: "water purifier", src: "/product-icons/water.png" },
  { keyword: "router", src: "/product-icons/controller.png" },
  { keyword: "modem", src: "/product-icons/router.png" },
  { keyword: "switch", src: "/product-icons/router.png" },
  { keyword: "server", src: "/product-icons/server.png" },
  { keyword: "cctv", src: "/product-icons/camera-dslr.png" },
  { keyword: "dvr", src: "/product-icons/camera-dslr.png" },
  { keyword: "lan", src: "/product-icons/router.png" },
  { keyword: "screen", src: "/product-icons/projector.png" },
  { keyword: "led wall", src: "/product-icons/led-wall.png" },
  { keyword: "wireless mic", src: "/product-icons/microphone.png" },
  { keyword: "teleprompter", src: "/product-icons/monitor.png" },
  { keyword: "generator", src: "/product-icons/router.png" },
  { keyword: "ups", src: "/product-icons/ups.png" },
  { keyword: "inverter", src: "/product-icons/router.png" },
  { keyword: "power bank", src: "/product-icons/air-purifier.png" },
  { keyword: "extension", src: "/product-icons/extension.png" },
  { keyword: "surge", src: "/product-icons/extension.png" },
];

export function productImageFor(name: string): string {
  const n = name.toLowerCase();
  const hit = PRODUCT_IMAGE_KEYWORDS.find(({ keyword }) => n.includes(keyword));
  return hit?.src ?? "/product-icons/monitor.png";
}

const CATEGORY_LOGOS: Record<string, string> = {
  "audio-video-equipment": "/product-icons/camera-dslr.png",
  "office-equipment": "/product-icons/printer.png",
  "home-appliances": "/product-icons/air-conditioner.png",
  "networking-it": "/product-icons/router.png",
  "event-presentation": "/product-icons/projector.png",
  "power-misc": "/product-icons/router.png",
  "entertainment-electronics": "/product-icons/gaming-console-new.png",
  "computing-devices": "/product-icons/laptop.png",
};

export function categoryLogoFor(slug: string): string {
  return CATEGORY_LOGOS[slug] ?? "/product-icons/monitor.png";
}

export function productImageForGroup(groupSlug: string, productName: string): string {
  void groupSlug;
  return productImageFor(productName);
}

const EMOJI_PRODUCT_GROUPS = new Set([
  "audio-video-equipment",
  "office-equipment",
  "home-appliances",
  "networking-it",
  "event-presentation",
  "power-misc",
]);

const PRODUCT_EMOJI_KEYWORDS: Array<{ keyword: string; emoji: string }> = [
  { keyword: "refrigerator", emoji: "" },
  { keyword: "washing", emoji: "🧺" },
  { keyword: "microwave", emoji: "♨️" },
  { keyword: "air conditioner", emoji: "" },
  { keyword: "fan", emoji: "🌀" },
  { keyword: "air purifier", emoji: "" },
  { keyword: "water purifier", emoji: "" },
  { keyword: "camera", emoji: "" },
  { keyword: "camcorder", emoji: "🎥" },
  { keyword: "microphone", emoji: "" },
  { keyword: "speaker", emoji: "" },
  { keyword: "dj", emoji: "" },
  { keyword: "mixer", emoji: "🎚️" },
  { keyword: "printer", emoji: "🖨️" },
  { keyword: "scanner", emoji: "📠" },
  { keyword: "photocopier", emoji: "📄" },
  { keyword: "biometric", emoji: "🆔" },
  { keyword: "conference", emoji: "☎️" },
  { keyword: "pos", emoji: "💳" },
  { keyword: "router", emoji: "" },
  { keyword: "modem", emoji: "🌐" },
  { keyword: "switch", emoji: "🔀" },
  { keyword: "server", emoji: "" },
  { keyword: "cctv", emoji: "📹" },
  { keyword: "dvr", emoji: "📼" },
  { keyword: "lan", emoji: "🔌" },
  { keyword: "projector", emoji: "📽️" },
  { keyword: "screen", emoji: "🖥️" },
  { keyword: "led wall", emoji: "" },
  { keyword: "wireless mic", emoji: "🎙️" },
  { keyword: "stage light", emoji: "💡" },
  { keyword: "teleprompter", emoji: "📝" },
  { keyword: "generator", emoji: "⚡" },
  { keyword: "ups", emoji: "" },
  { keyword: "inverter", emoji: "🔌" },
  { keyword: "power bank", emoji: "" },
  { keyword: "extension", emoji: "" },
  { keyword: "surge", emoji: "" },
];

export function productEmojiForGroup(groupSlug: string, productName: string): string | null {
  if (!EMOJI_PRODUCT_GROUPS.has(groupSlug)) return null;
  const n = productName.toLowerCase();
  const hit = PRODUCT_EMOJI_KEYWORDS.find(({ keyword }) => n.includes(keyword));
  return hit?.emoji ?? "🔧";
}

const PRODUCT_EMOJI_IMAGE_KEYWORDS: Array<{ keyword: string; src: string }> = [
  { keyword: "refrigerator", src: "/product-icons/fridge-emoji.png" },
  { keyword: "washing", src: "/product-icons/washing-machine-emoji.png" },
  { keyword: "microwave", src: "/product-icons/microwave-emoji.png" },
  { keyword: "fan", src: "/product-icons/fan-emoji.png" },
];

export function productEmojiImageForGroup(
  groupSlug: string,
  productName: string
): string | null {
  if (!EMOJI_PRODUCT_GROUPS.has(groupSlug)) return null;
  const n = productName.toLowerCase();
  const hit = PRODUCT_EMOJI_IMAGE_KEYWORDS.find(({ keyword }) => n.includes(keyword));
  return hit?.src ?? null;
}
