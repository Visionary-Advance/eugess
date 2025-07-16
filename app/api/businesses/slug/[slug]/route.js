import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    
    const business = await prisma.businesses.findFirst({
      where: { 
        slug: slug,
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
        neighborhood_id: true,
        price_level: true,
        cuisine_type: true,
        is_featured: true,
        is_verified: true,
        has_takeout: true,
        has_delivery: true,
        has_outdoor_seating: true,
        is_wheelchair_accessible: true,
        has_wifi: true,
        is_pet_friendly: true,
        has_parking: true,
        created_at: true,
        updated_at: true
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
    console.error('Error fetching business by slug:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}