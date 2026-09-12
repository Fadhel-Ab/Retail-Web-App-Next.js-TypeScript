import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { round2 } from "@/lib/utils";

const SHIPPING_ADDRESSES = [
  { fullName: "Sara Khalid", streetAddress: "Building 12, Road 3601", city: "Manama", postalCode: "317", country: "Bahrain" },
  { fullName: "Omar Naser", streetAddress: "Villa 45, Road 1224", city: "Riffa", postalCode: "902", country: "Bahrain" },
  { fullName: "Layla Hassan", streetAddress: "Flat 8, Building 220", city: "Muharraq", postalCode: "204", country: "Bahrain" },
  { fullName: "Yousef Ibrahim", streetAddress: "Avenue 42, Block 305", city: "Isa Town", postalCode: "551", country: "Bahrain" },
  { fullName: "Noor Al-Fadhli", streetAddress: "Building 9, Road 811", city: "Hamad Town", postalCode: "738", country: "Bahrain" },
  { fullName: "Mariam Saeed", streetAddress: "Villa 3, Road 2708", city: "Saar", postalCode: "417", country: "Bahrain" },
  { fullName: "Khalid Rashid", streetAddress: "Flat 14, Building 77", city: "Manama", postalCode: "199", country: "Bahrain" },
  { fullName: "Fatima Zayed", streetAddress: "Building 61, Road 1503", city: "Budaiya", postalCode: "628", country: "Bahrain" },
  { fullName: "Ahmed", streetAddress: "Villa 20, Road 934", city: "Manama", postalCode: "355", country: "Bahrain" },
];

const PAYMENT_METHODS = ["BenefitPay", "CashOnDelivery"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]) {
  return arr[randomInt(0, arr.length - 1)];
}

function pickRandomUnique<T>(arr: T[], count: number) {
  const pool = [...arr];
  const picked: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = randomInt(0, pool.length - 1);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

// biases dates toward more recent months for a nicer sales trend
function randomDateWithinLastMonths(months: number) {
  const now = new Date();
  const monthOffset = Math.floor(Math.pow(Math.random(), 1.6) * months);
  const date = new Date(now);
  date.setMonth(date.getMonth() - monthOffset);
  date.setDate(randomInt(1, 27));
  date.setHours(randomInt(8, 21), randomInt(0, 59), 0, 0);
  return date;
}

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  const users = await prisma.user.findMany({ where: { role: "user" } });
  const products = await prisma.product.findMany();

  if (users.length === 0 || products.length === 0) {
    throw new Error("Run db/seed.ts first to populate users and products.");
  }

  // reset existing orders so this script is safe to re-run
  await prisma.order.deleteMany();

  const ORDER_COUNT = 60;

  for (let i = 0; i < ORDER_COUNT; i++) {
    const user = pickRandom(users);
    const itemCount = randomInt(1, 4);
    const chosenProducts = pickRandomUnique(products, itemCount);

    const orderItems = chosenProducts.map((product) => ({
      productId: product.id,
      qty: randomInt(1, 3),
      price: product.price,
      name: product.name,
      nameAr: product.nameAr,
      slug: product.slug,
      image: product.images[0],
    }));

    const itemsPrice = round2(
      orderItems.reduce(
        (sum, item) => sum + Number(item.price) * item.qty,
        0,
      ),
    );
    const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
    const taxPrice = round2(0.15 * itemsPrice);
    const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

    const createdAt = randomDateWithinLastMonths(6);
    const isPaid = Math.random() < 0.85;
    const paidAt = isPaid
      ? new Date(createdAt.getTime() + randomInt(1, 6) * 60 * 60 * 1000)
      : null;
    const isDelivered = isPaid && Math.random() < 0.6;
    const deliveredAt =
      isDelivered && paidAt
        ? new Date(paidAt.getTime() + randomInt(1, 4) * 24 * 60 * 60 * 1000)
        : null;

    await prisma.order.create({
      data: {
        userId: user.id,
        shippingAddress: pickRandom(SHIPPING_ADDRESSES) as Prisma.InputJsonValue,
        paymentMethod: pickRandom(PAYMENT_METHODS),
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        isPaid,
        paidAt,
        isDelivered,
        deliveredAt,
        createdAt,
        orderItems: {
          create: orderItems,
        },
      },
    });
  }

  console.log(`Seeded ${ORDER_COUNT} orders successfully.`);
}

main();
