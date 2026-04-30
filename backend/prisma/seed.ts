import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await hashPassword("Admin123!@#");
  const admin = await prisma.user.upsert({
    where: { email: "admin@furniture.com" },
    update: {},
    create: {
      email: "admin@furniture.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      isActive: true,
      emailVerified: true,
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create test user
  const userPassword = await hashPassword("User123!@#");
  const user = await prisma.user.upsert({
    where: { email: "user@furniture.com" },
    update: {},
    create: {
      email: "user@furniture.com",
      password: userPassword,
      name: "Test User",
      phone: "0123456789",
      role: "USER",
      isActive: true,
      emailVerified: true,
    },
  });
  console.log("✅ Test user created:", user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "living-room" },
      update: {},
      create: {
        name: "Living Room",
        slug: "living-room",
        description: "Furniture for your living room",
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "bedroom" },
      update: {},
      create: {
        name: "Bedroom",
        slug: "bedroom",
        description: "Furniture for your bedroom",
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "dining-room" },
      update: {},
      create: {
        name: "Dining Room",
        slug: "dining-room",
        description: "Furniture for your dining room",
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "office" },
      update: {},
      create: {
        name: "Office",
        slug: "office",
        description: "Furniture for your home office",
        isActive: true,
      },
    }),
  ]);
  console.log("✅ Categories created:", categories.length);

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: "SOFA-001" },
      update: {},
      create: {
        name: "Modern Leather Sofa",
        slug: "modern-leather-sofa",
        description: "Luxurious 3-seater leather sofa with premium quality",
        price: 15000000,
        salePrice: 12000000,
        sku: "SOFA-001",
        stock: 10,
        categoryId: categories[0].id,
        isFeatured: true,
        isActive: true,
        images: {
          create: [
            {
              url: "https://via.placeholder.com/800x600",
              altText: "Modern Leather Sofa",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { sku: "BED-001" },
      update: {},
      create: {
        name: "King Size Bed Frame",
        slug: "king-size-bed-frame",
        description: "Elegant wooden bed frame for king size mattress",
        price: 20000000,
        salePrice: 18000000,
        sku: "BED-001",
        stock: 5,
        categoryId: categories[1].id,
        isFeatured: true,
        isActive: true,
        images: {
          create: [
            {
              url: "https://via.placeholder.com/800x600",
              altText: "King Size Bed Frame",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { sku: "TABLE-001" },
      update: {},
      create: {
        name: "Dining Table Set",
        slug: "dining-table-set",
        description: "6-seater dining table with chairs",
        price: 25000000,
        sku: "TABLE-001",
        stock: 8,
        categoryId: categories[2].id,
        isFeatured: true,
        isActive: true,
        images: {
          create: [
            {
              url: "https://via.placeholder.com/800x600",
              altText: "Dining Table Set",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { sku: "DESK-001" },
      update: {},
      create: {
        name: "Executive Office Desk",
        slug: "executive-office-desk",
        description: "Premium office desk with drawers",
        price: 12000000,
        salePrice: 10000000,
        sku: "DESK-001",
        stock: 15,
        categoryId: categories[3].id,
        isFeatured: false,
        isActive: true,
        images: {
          create: [
            {
              url: "https://via.placeholder.com/800x600",
              altText: "Executive Office Desk",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      },
    }),
  ]);
  console.log("✅ Products created:", products.length);

  // Create vouchers
  const vouchers = await Promise.all([
    prisma.voucher.upsert({
      where: { code: "WELCOME10" },
      update: {},
      create: {
        code: "WELCOME10",
        description: "Welcome discount 10% for new customers",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderValue: 5000000,
        maxDiscount: 1000000,
        usageLimit: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
      },
    }),
    prisma.voucher.upsert({
      where: { code: "SAVE500K" },
      update: {},
      create: {
        code: "SAVE500K",
        description: "Fixed discount 500K for orders over 10M",
        discountType: "FIXED",
        discountValue: 500000,
        minOrderValue: 10000000,
        usageLimit: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    }),
  ]);
  console.log("✅ Vouchers created:", vouchers.length);

  console.log("🎉 Seeding completed!");
  console.log("\n📝 Login credentials:");
  console.log("Admin:");
  console.log("  Email: admin@furniture.com");
  console.log("  Password: Admin123!@#");
  console.log("\nUser:");
  console.log("  Email: user@furniture.com");
  console.log("  Password: User123!@#");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
