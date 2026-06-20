export function formatPKR(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// WhatsApp + phone defaults — replace with real numbers via env later
export const CONTACT = {
  whatsapp: "+923001234567",
  phone: "+92 300 1234567",
  email: "hello@premiumgoats.pk",
  address: "Sahiwal Valley Farm, Sahiwal, Punjab, Pakistan",
  mapEmbed:
    "https://www.google.com/maps?q=Sahiwal,Pakistan&output=embed",
};

export function whatsappLink(message: string) {
  const num = CONTACT.whatsapp.replace(/[^\d]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
];

export function deliveryFee(city: string, subtotal: number) {
  if (subtotal >= 150000) return 0;
  const tier1 = ["Lahore", "Sahiwal", "Faisalabad", "Sargodha"];
  if (tier1.includes(city)) return 2500;
  return 5000;
}
