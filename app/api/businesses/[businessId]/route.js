import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { businessId } = await params;

    const business = await prisma.businesses.findUnique({
      where: {
        id: businessId,
        is_active: true
      },
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
        price_level: true,
        is_featured: true,
        // Add rating fields if you have them
      }
    });

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    return Response.json({
      ...business,
      id: business.id.toString()
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}