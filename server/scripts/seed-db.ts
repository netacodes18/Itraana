import mongoose from "mongoose";
import connectDB from "../src/config/db";
import Product from "../src/models/Product";

const seedProducts = [
  {
    name: "Royal Oud",
    slug: "royal-oud",
    price: 3499,
    description: "Deep, woody oud with warm amber undertones",
    image: "/assets/attar1.jpg",
    category: "Woody",
    sizes: ["3ml", "6ml", "12ml"],
    stock: 50,
    featured: true,
    isActive: true,
  },
  {
    name: "Amber Noir",
    slug: "amber-noir",
    price: 2999,
    description: "Sensual amber blended with soft spices",
    image: "/assets/attar1.jpg",
    category: "Spicy",
    sizes: ["3ml", "6ml", "12ml"],
    stock: 40,
    featured: true,
    isActive: true,
  },
  {
    name: "Musk Elixir",
    slug: "musk-elixir",
    price: 2499,
    description: "Clean white musk with lingering depth",
    image: "/assets/attar1.jpg",
    category: "Musk",
    sizes: ["3ml", "6ml", "12ml"],
    stock: 60,
    featured: true,
    isActive: true,
  },
  {
    name: "Rose Attar",
    slug: "rose-attar",
    price: 2799,
    description: "Pure Indian rose distilled traditionally",
    image: "/assets/attar1.jpg",
    category: "Floral",
    sizes: ["3ml", "6ml", "12ml"],
    stock: 35,
    featured: false,
    isActive: true,
  },
  {
    name: "Saffron Silk",
    slug: "saffron-silk",
    price: 3199,
    description: "Rare saffron infused with soft florals",
    image: "/assets/attar1.jpg",
    category: "Floral",
    sizes: ["3ml", "6ml", "12ml"],
    stock: 25,
    featured: false,
    isActive: true,
  },
  {
    name: "Vetiver Calm",
    slug: "vetiver-calm",
    price: 2699,
    description: "Earthy vetiver for grounding elegance",
    image: "/assets/attar1.jpg",
    category: "Earthy",
    sizes: ["3ml", "6ml", "12ml"],
    stock: 30,
    featured: false,
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    console.log("Connecting to database for seeding...");
    await connectDB();

    console.log("Clearing existing products...");
    await Product.deleteMany({});

    console.log("Seeding products...");
    const createdProducts = await Product.insertMany(seedProducts);
    console.log(`Successfully seeded ${createdProducts.length} products!`);

    console.log("Products detail:");
    createdProducts.forEach((p) => {
      console.log(`- ${p.name} (${p.category}): ID = ${p._id}, Slug = ${p.slug}`);
    });

    console.log("Seeding complete. Closing database connection...");
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during database seeding:", error);
    process.exit(1);
  }
}

seedDatabase();
