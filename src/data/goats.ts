import beetal from "@/assets/goat-beetal.jpg";
import makhi from "@/assets/goat-makhicheeni.jpg";
import teddy from "@/assets/goat-teddy.jpg";
import kamori from "@/assets/goat-kamori.jpg";

export interface Goat {
  id: string;
  name: string;
  breed: string;
  ageMonths: number;
  weightKg: number;
  price: number;
  health: "healthy";
  available: boolean;
  farm: string;
  images: string[];
  description: string;
}

export const goats: Goat[] = [
  {
    id: "noor-beetal-01",
    name: "Noor",
    breed: "Beetal",
    ageMonths: 14,
    weightKg: 52,
    price: 95000,
    health: "healthy",
    available: true,
    farm: "Sahiwal Valley Farm, Punjab",
    images: [beetal, beetal, beetal],
    description:
      "A graceful Beetal with classic long droopy ears and a snow-white coat. Hand-fed since birth, calm temperament, ideal for first-time keepers.",
  },
  {
    id: "raja-makhi-02",
    name: "Raja",
    breed: "Makhi Cheeni",
    ageMonths: 18,
    weightKg: 58,
    price: 125000,
    health: "healthy",
    available: true,
    farm: "Indus Heritage Farm, Sindh",
    images: [makhi, makhi, makhi],
    description:
      "Striking honey-brown Makhi Cheeni with classic white markings. A show-quality animal — vaccinated, dewormed, and inspected by our resident vet.",
  },
  {
    id: "kala-teddy-03",
    name: "Kala",
    breed: "Teddy",
    ageMonths: 9,
    weightKg: 28,
    price: 42000,
    health: "healthy",
    available: true,
    farm: "Pothohar Highlands, Punjab",
    images: [teddy, teddy, teddy],
    description:
      "Compact and friendly Teddy goat with a glossy black coat. Easy to handle and ideal for smaller homes. Comes with health passport and ear tag.",
  },
  {
    id: "shahzada-kamori-04",
    name: "Shahzada",
    breed: "Kamori",
    ageMonths: 24,
    weightKg: 72,
    price: 185000,
    health: "healthy",
    available: true,
    farm: "Larkana Heritage Farm, Sindh",
    images: [kamori, kamori, kamori],
    description:
      "A magnificent Kamori with sweeping horns and rich mahogany coat. One of our most majestic animals — perfect for connoisseurs of the breed.",
  },
  {
    id: "chand-beetal-05",
    name: "Chand",
    breed: "Beetal",
    ageMonths: 12,
    weightKg: 46,
    price: 82000,
    health: "healthy",
    available: true,
    farm: "Sahiwal Valley Farm, Punjab",
    images: [beetal, beetal],
    description:
      "A young Beetal with excellent confirmation and gentle temperament. Raised on natural feed with daily pasture access.",
  },
  {
    id: "sultan-kamori-06",
    name: "Sultan",
    breed: "Kamori",
    ageMonths: 30,
    weightKg: 85,
    price: 225000,
    health: "healthy",
    available: false,
    farm: "Larkana Heritage Farm, Sindh",
    images: [kamori, kamori],
    description:
      "A prize Kamori — recently reserved. Contact us to be notified when similar animals become available.",
  },
];

export const breeds = Array.from(new Set(goats.map((g) => g.breed)));

export function getGoat(id: string) {
  return goats.find((g) => g.id === id);
}
