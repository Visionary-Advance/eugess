import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get total count of active businesses
    const totalCount = await prisma.businesses.count({
      where: {
        is_active: true
      }
    });

    if (totalCount === 0) {
      return Response.json([]);
    }

    // Generate 3 random offsets
    const randomOffsets = [];
    for (let i = 0; i < Math.min(3, totalCount); i++) {
      let randomOffset;
      do {
        randomOffset = Math.floor(Math.random() * totalCount);
      } while (randomOffsets.includes(randomOffset));
      randomOffsets.push(randomOffset);
    }

    // Fetch businesses at those random positions
    const randomBusinesses = await Promise.all(
      randomOffsets.map(offset => 
        prisma.businesses.findMany({
          take: 1,
          skip: offset,
          where: {
            is_active: true
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            short_description: true,
            phone: true,
            street_address: true,
            city: true,
            state: true,
            zip_code: true,
            cuisine_type: true,
            price_level: true,
            is_featured: true,
            image_url: true, // Add this line
            created_at: true
          },
          orderBy: {
            created_at: 'desc'
          }
        })
      )
    );

    // Flatten the results and convert BigInt IDs to strings
    const businesses = randomBusinesses
      .flat()
      .map(business => ({
        ...business,
        id: business.id.toString(),
      }));

    return Response.json(businesses);
  } catch (error) {
    console.error('Error fetching random businesses:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}