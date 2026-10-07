function randomSuffix(): string {
  return String(Math.floor(100 + Math.random() * 900));
}

export function newSellerId(phone: string): string {
  return `SEL-${phone.replace(/\D/g, "").slice(-10)}`;
}

export function newApplianceId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `APP-${y}${m}${day}-${randomSuffix()}`;
}

export function newBookingId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `BK-${y}${m}${day}-${randomSuffix()}`;
}
