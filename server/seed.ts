import dotenv from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { vehicle } from "./src/db/schema.js";

dotenv.config({ path: "../.env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

interface MakerDef {
  name: string;
  models: string[];
  categories: string[];
  bg: string;
  fg: string;
  font: string;
}

const MAKERS: MakerDef[] = [
  { name: "Toyota", models: ["Camry", "Corolla", "RAV4", "Highlander", "Prius", "Tacoma", "Tundra", "4Runner"], categories: ["Sedan", "SUV", "Truck", "Coupe"], bg: "1a1a2e", fg: "e94560", font: "roboto" },
  { name: "Honda", models: ["Civic", "Accord", "CR-V", "Pilot", "HR-V", "Odyssey", "Ridgeline"], categories: ["Sedan", "SUV", "Truck"], bg: "0f3460", fg: "e94560", font: "roboto" },
  { name: "Ford", models: ["F-150", "Mustang", "Explorer", "Escape", "Bronco", "Ranger", "Edge", "Maverick"], categories: ["Truck", "Coupe", "SUV"], bg: "003471", fg: "ffffff", font: "montserrat" },
  { name: "Chevrolet", models: ["Silverado", "Malibu", "Equinox", "Tahoe", "Camaro", "Traverse", "Colorado"], categories: ["Truck", "Sedan", "SUV", "Coupe"], bg: "c5a84e", fg: "1a1a1a", font: "montserrat" },
  { name: "BMW", models: ["3 Series", "5 Series", "X3", "X5", "7 Series", "Z4", "X7", "M4"], categories: ["Sedan", "SUV", "Coupe"], bg: "0066b1", fg: "ffffff", font: "poppins" },
  { name: "Mercedes-Benz", models: ["C-Class", "E-Class", "GLC", "GLE", "S-Class", "A-Class", "CLA"], categories: ["Sedan", "SUV"], bg: "333333", fg: "c0c0c0", font: "poppins" },
  { name: "Audi", models: ["A4", "A6", "Q5", "Q7", "A3", "e-tron", "Q3"], categories: ["Sedan", "SUV"], bg: "bb0a30", fg: "ffffff", font: "poppins" },
  { name: "Nissan", models: ["Altima", "Sentra", "Rogue", "Pathfinder", "Frontier", "Maxima", "Kicks"], categories: ["Sedan", "SUV", "Truck"], bg: "c3002f", fg: "ffffff", font: "roboto" },
  { name: "Hyundai", models: ["Elantra", "Tucson", "Santa Fe", "Sonata", "Kona", "Palisade", "Ioniq 5"], categories: ["Sedan", "SUV"], bg: "002c5f", fg: "ffffff", font: "roboto" },
  { name: "Kia", models: ["Forte", "Sportage", "Telluride", "Sorento", "K5", "Seltos", "EV6"], categories: ["Sedan", "SUV"], bg: "05141f", fg: "bb162b", font: "roboto" },
  { name: "Volkswagen", models: ["Jetta", "Tiguan", "Atlas", "Taos", "Golf", "ID.4", "Passat"], categories: ["Sedan", "SUV", "Hatchback"], bg: "001e50", fg: "ffffff", font: "poppins" },
  { name: "Subaru", models: ["Outback", "Forester", "Crosstrek", "Impreza", "WRX", "Ascent"], categories: ["SUV", "Sedan", "Hatchback"], bg: "013a63", fg: "f7c948", font: "roboto" },
  { name: "Mazda", models: ["CX-5", "CX-30", "Mazda3", "CX-50", "MX-5", "CX-90"], categories: ["SUV", "Sedan", "Coupe", "Hatchback"], bg: "910a2a", fg: "ffffff", font: "poppins" },
  { name: "Jeep", models: ["Grand Cherokee", "Wrangler", "Cherokee", "Gladiator", "Compass", "Renegade"], categories: ["SUV", "Truck"], bg: "1a1a1a", fg: "8b8b8b", font: "montserrat" },
  { name: "Lexus", models: ["RX", "ES", "NX", "IS", "GX", "UX", "LS"], categories: ["SUV", "Sedan"], bg: "1a1a1a", fg: "c4a35a", font: "poppins" },
  { name: "GMC", models: ["Sierra", "Terrain", "Acadia", "Canyon", "Yukon"], categories: ["Truck", "SUV"], bg: "1c1c1c", fg: "b5985a", font: "montserrat" },
  { name: "Ram", models: ["1500", "2500", "3500", "ProMaster"], categories: ["Truck"], bg: "8b0000", fg: "ffffff", font: "montserrat" },
  { name: "Tesla", models: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"], categories: ["Sedan", "SUV", "Truck"], bg: "cc0000", fg: "ffffff", font: "poppins" },
  { name: "Buick", models: ["Enclave", "Encore", "Envision", "LaCrosse"], categories: ["SUV", "Sedan"], bg: "4a2c82", fg: "ffffff", font: "roboto" },
  { name: "Chrysler", models: ["Pacifica", "300"], categories: ["SUV", "Sedan"], bg: "1a1a1a", fg: "a0a0a0", font: "roboto" },
  { name: "Dodge", models: ["Challenger", "Durango", "Charger", "Hornet"], categories: ["Coupe", "SUV", "Sedan"], bg: "9b0000", fg: "ffffff", font: "montserrat" },
  { name: "Cadillac", models: ["Escalade", "CT5", "XT4", "XT6", "Lyriq"], categories: ["SUV", "Sedan"], bg: "1a1a1a", fg: "c4a35a", font: "poppins" },
  { name: "Acura", models: ["MDX", "RDX", "Integra", "TLX"], categories: ["SUV", "Sedan"], bg: "1a1a1a", fg: "c0c0c0", font: "poppins" },
  { name: "Infiniti", models: ["QX60", "QX50", "Q50", "QX80"], categories: ["SUV", "Sedan"], bg: "1a1a1a", fg: "b8860b", font: "poppins" },
  { name: "Mitsubishi", models: ["Outlander", "Eclipse Cross", "Mirage", "Outlander Sport"], categories: ["SUV", "Hatchback"], bg: "e60012", fg: "ffffff", font: "roboto" },
  { name: "Volvo", models: ["XC60", "XC90", "XC40", "S60", "V60"], categories: ["SUV", "Sedan"], bg: "003057", fg: "c0c0c0", font: "poppins" },
  { name: "Land Rover", models: ["Range Rover", "Discovery", "Defender", "Range Rover Sport", "Evoque"], categories: ["SUV"], bg: "1a3c34", fg: "c0c0c0", font: "poppins" },
  { name: "Porsche", models: ["911", "Cayenne", "Macan", "Taycan", "Panamera"], categories: ["Coupe", "SUV", "Sedan"], bg: "1a1a1a", fg: "c0c0c0", font: "poppins" },
  { name: "Jaguar", models: ["F-Pace", "E-Pace", "I-Pace", "XF", "F-Type"], categories: ["SUV", "Sedan", "Coupe"], bg: "1a1a1a", fg: "c0c0c0", font: "poppins" },
  { name: "Mini", models: ["Cooper", "Countryman", "Clubman"], categories: ["Hatchback", "SUV"], bg: "1a1a1a", fg: "c0c0c0", font: "poppins" },
  { name: "Alfa Romeo", models: ["Giulia", "Stelvio", "Tonale"], categories: ["Sedan", "SUV"], bg: "8b0000", fg: "ffffff", font: "poppins" },
];

const DESCRIPTIONS = [
  "Well-maintained vehicle with full service history",
  "One owner, low mileage, garage kept",
  "Excellent condition inside and out",
  "Perfect daily driver with great fuel economy",
  "Loaded with premium features and options",
  "Non-smoker vehicle, pet-free interior",
  "Recently serviced with new tires",
  "Highway miles, city-driven sparingly",
  "Accident-free with clean title",
  "Family vehicle, carefully driven",
  "Sport-tuned suspension for dynamic handling",
  "Luxury interior with leather seats",
  "All-wheel drive for all-weather capability",
  "Towing package included, ready to haul",
  "Sunroof, navigation, backup camera",
  "Hybrid powertrain for maximum efficiency",
  "Off-road ready with skid plates",
  "Premium sound system throughout",
  "Heated and cooled seats for year-round comfort",
  "Blind-spot monitoring and lane assist",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildImageUrl(maker: string, model: string, bg: string, fg: string, font: string): string {
  const text = encodeURIComponent(`${maker} ${model}`);
  return `https://placehold.co/600x400/${bg}/${fg}?text=${text}&font=${font}`;
}

function generateVehicles(): {
  maker: string;
  model: string;
  category: string;
  price: string;
  quantity: number;
  description: string;
  imageUrl: string;
}[] {
  const vehicles: ReturnType<typeof generateVehicles> = [];

  // price ranges by category
  const priceRanges: Record<string, [number, number]> = {
    Hatchback: [16000, 30000],
    Sedan: [20000, 55000],
    SUV: [28000, 80000],
    Truck: [30000, 75000],
    Coupe: [25000, 90000],
  };

  for (let i = 0; i < 1000; i++) {
    const makerDef = pick(MAKERS);
    const model = pick(makerDef.models);
    const category = pick(makerDef.categories);
    const [minPrice, maxPrice] = priceRanges[category] ?? [20000, 50000];
    const price = randInt(minPrice, maxPrice) + Math.round(Math.random() * 99) / 100;
    const quantity = randInt(0, 50);
    const description = pick(DESCRIPTIONS);
    const imageUrl = buildImageUrl(makerDef.name, model, makerDef.bg, makerDef.fg, makerDef.font);

    vehicles.push({
      maker: makerDef.name,
      model,
      category,
      price: price.toFixed(2),
      quantity,
      description,
      imageUrl,
    });
  }

  return vehicles;
}

async function seed() {
  console.log("Seeding 1000 vehicles...");
  const vehicles = generateVehicles();

  // Insert in batches of 100
  const BATCH = 100;
  for (let i = 0; i < vehicles.length; i += BATCH) {
    const batch = vehicles.slice(i, i + BATCH);
    await db.insert(vehicle).values(batch);
    console.log(`  Inserted ${Math.min(i + BATCH, vehicles.length)}/${vehicles.length}`);
  }

  console.log("Done!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
