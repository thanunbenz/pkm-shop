import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Pokemon TCG Product Names and Descriptions
const pokemonProducts = [
  // Booster Packs
  {
    name: 'Scarlet & Violet Booster Pack',
    description: 'Contains 10 cards from the Scarlet & Violet series. Each pack includes a code card for Pokemon TCG Live.',
    category: 'PACK' as ProductStatus,
    basePrice: 149,
    codesPerProduct: 5
  },
  {
    name: 'Paldea Evolved Booster Pack',
    description: 'Discover new Pokemon from the Paldea region. 10 cards per pack with online code.',
    category: 'PACK' as ProductStatus,
    basePrice: 149,
    codesPerProduct: 5
  },
  {
    name: 'Obsidian Flames Booster Pack',
    description: 'Unleash the power of fire with Obsidian Flames. Includes 10 cards and digital code.',
    category: 'PACK' as ProductStatus,
    basePrice: 149,
    codesPerProduct: 5
  },
  {
    name: '151 Booster Pack',
    description: 'Celebrate the original 151 Pokemon! Contains 10 cards and TCG Live code.',
    category: 'PACK' as ProductStatus,
    basePrice: 169,
    codesPerProduct: 4
  },
  {
    name: 'Paradox Rift Booster Pack',
    description: 'Travel through time with Paradox Pokemon. 10 cards per pack with code card.',
    category: 'PACK' as ProductStatus,
    basePrice: 149,
    codesPerProduct: 5
  },
  {
    name: 'Paldean Fates Booster Pack',
    description: 'Special set featuring Shiny Pokemon from Paldea. 10 cards and online code.',
    category: 'PACK' as ProductStatus,
    basePrice: 159,
    codesPerProduct: 4
  },
  {
    name: 'Temporal Forces Booster Pack',
    description: 'Master the power of time with Temporal Forces. Includes 10 cards and code.',
    category: 'PACK' as ProductStatus,
    basePrice: 149,
    codesPerProduct: 5
  },
  {
    name: 'Twilight Masquerade Booster Pack',
    description: 'Mysterious Pokemon await in Twilight Masquerade. 10 cards per pack.',
    category: 'PACK' as ProductStatus,
    basePrice: 149,
    codesPerProduct: 5
  },
  {
    name: 'Shrouded Fable Booster Pack',
    description: 'Legendary tales come to life. Contains 10 cards and TCG Live code.',
    category: 'PACK' as ProductStatus,
    basePrice: 149,
    codesPerProduct: 5
  },
  {
    name: 'Stellar Crown Booster Pack',
    description: 'Reach for the stars with Stellar Crown Pokemon. 10 cards and digital code.',
    category: 'PACK' as ProductStatus,
    basePrice: 149,
    codesPerProduct: 5
  },

  // Booster Boxes
  {
    name: 'Scarlet & Violet Booster Box',
    description: 'Complete booster box with 36 packs. Perfect for collectors and players.',
    category: 'BOX' as ProductStatus,
    basePrice: 4999,
    codesPerProduct: 36
  },
  {
    name: 'Paldea Evolved Booster Box',
    description: '36 booster packs in sealed display box. Includes all code cards.',
    category: 'BOX' as ProductStatus,
    basePrice: 4999,
    codesPerProduct: 36
  },
  {
    name: 'Obsidian Flames Booster Box',
    description: 'Full box of 36 Obsidian Flames packs with codes.',
    category: 'BOX' as ProductStatus,
    basePrice: 4999,
    codesPerProduct: 36
  },
  {
    name: '151 Booster Box',
    description: 'Premium box featuring the original 151 Pokemon. 36 packs included.',
    category: 'BOX' as ProductStatus,
    basePrice: 5999,
    codesPerProduct: 36
  },
  {
    name: 'Paradox Rift Booster Box',
    description: '36 packs of Paradox Rift with all digital codes.',
    category: 'BOX' as ProductStatus,
    basePrice: 4999,
    codesPerProduct: 36
  },
  {
    name: 'Temporal Forces Booster Box',
    description: 'Complete display box with 36 booster packs and codes.',
    category: 'BOX' as ProductStatus,
    basePrice: 4999,
    codesPerProduct: 36
  },

  // Promo and Special Products
  {
    name: 'Charizard ex Premium Collection',
    description: 'Exclusive Charizard ex promo card with 5 booster packs and code cards.',
    category: 'PROMO' as ProductStatus,
    basePrice: 1299,
    codesPerProduct: 6
  },
  {
    name: 'Pikachu VMAX Special Box',
    description: 'Limited edition Pikachu VMAX with 4 booster packs and exclusive code.',
    category: 'PROMO' as ProductStatus,
    basePrice: 999,
    codesPerProduct: 5
  },
  {
    name: 'Elite Trainer Box - Scarlet & Violet',
    description: 'Complete training kit with 9 booster packs, energy cards, and accessories.',
    category: 'PROMO' as ProductStatus,
    basePrice: 1599,
    codesPerProduct: 9
  },
  {
    name: 'Elite Trainer Box - 151',
    description: 'Special 151 Elite Trainer Box with 10 booster packs and premium items.',
    category: 'PROMO' as ProductStatus,
    basePrice: 1899,
    codesPerProduct: 10
  },
  {
    name: 'Mewtwo ex Collection Box',
    description: 'Legendary Mewtwo ex promo with 4 booster packs and code cards.',
    category: 'PROMO' as ProductStatus,
    basePrice: 899,
    codesPerProduct: 5
  },
  {
    name: 'Umbreon VMAX Premium Collection',
    description: 'Shiny Umbreon VMAX with 6 booster packs and exclusive codes.',
    category: 'PROMO' as ProductStatus,
    basePrice: 1399,
    codesPerProduct: 7
  },
  {
    name: 'Rayquaza VMAX Box',
    description: 'Powerful Rayquaza VMAX promo with 4 booster packs.',
    category: 'PROMO' as ProductStatus,
    basePrice: 999,
    codesPerProduct: 5
  },
  {
    name: 'Garchomp ex Premium Collection',
    description: 'Rare Garchomp ex with 5 booster packs and digital codes.',
    category: 'PROMO' as ProductStatus,
    basePrice: 1199,
    codesPerProduct: 6
  },
  {
    name: 'Sylveon VMAX Collection',
    description: 'Beautiful Sylveon VMAX with 4 booster packs and codes.',
    category: 'PROMO' as ProductStatus,
    basePrice: 999,
    codesPerProduct: 5
  },
];

// Generate random Pokemon TCG Live codes
function generatePokemonCode(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar characters
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  return segments.join('-');
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.code.deleteMany();
  await prisma.product.deleteMany();

  console.log('📦 Creating products with codes...');

  let totalProducts = 0;
  let totalCodes = 0;

  for (const productData of pokemonProducts) {
    // Determine if product is on sale (30% chance)
    const isOnSale = Math.random() < 0.3;
    const discountPrice = isOnSale
      ? Math.floor(productData.basePrice * 0.85) // 15% discount
      : productData.basePrice;

    // Determine if recommended (20% chance)
    const isRecommended = Math.random() < 0.2;

    // Create product
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.basePrice,
        discountprice: discountPrice,
        issale: isOnSale,
        isrecommend: isRecommended,
        category: productData.category,
        image: null, // Will be added manually later
        imageId: '-',
      },
    });

    totalProducts++;

    // Create codes for this product
    const codes = [];
    for (let i = 0; i < productData.codesPerProduct; i++) {
      codes.push({
        code: generatePokemonCode(),
        isUsed: false,
        productId: product.id,
      });
    }

    await prisma.code.createMany({
      data: codes,
    });

    totalCodes += codes.length;

    console.log(`  ✅ Created ${product.name} with ${codes.length} codes`);
  }

  console.log('\n📊 Seed Summary:');
  console.log(`  📦 Total Products: ${totalProducts}`);
  console.log(`  🎫 Total Codes: ${totalCodes}`);
  console.log('  💰 Price Range: ฿149 - ฿5,999');
  console.log('  🏷️  Categories: PACK, BOX, PROMO');
  console.log('\n✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
