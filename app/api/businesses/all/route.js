import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const businesses = await prisma.businesses.findMany({
      where: {
        is_active: true
      },
      orderBy: [
        { is_featured: 'desc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        short_description: true,
        phone: true,
        email: true,
        website: true,
        street_address: true,
        city: true,
        state: true,
        zip_code: true,
        neighborhood_id: true,
        price_level: true,
        cuisine_type: true,
        is_featured: true,
        has_takeout: true,
        has_delivery: true,
        has_outdoor_seating: true,
        is_wheelchair_accessible: true,
        has_wifi: true,
        is_pet_friendly: true,
        has_parking: true,
        image_url: true, // Add this line
      }
    });

    const serializedBusinesses = businesses.map(business => ({
      ...business,
      id: business.id.toString(),
    }));

    return Response.json(serializedBusinesses);
  } catch (error) {
    console.error('Error fetching all businesses:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}