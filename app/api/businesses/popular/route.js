import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const businesses = await prisma.businesses.findMany({
      take: 2,
      where: {
        is_active: true,
        is_featured: true
      },
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        short_description: true,
        street_address: true,
        city: true,
        state: true,
        zip_code: true,
        image_url: true, // Add this line
      }
    });

    // Convert BigInt fields to strings
    const serializedBusinesses = businesses.map(business => ({
      ...business,
      id: business.id.toString(),
    }));

    return Response.json(serializedBusinesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}