// app/api/businesses/category/[categoryId]/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { categoryId } = await params;

    const businessesWithDetails = await prisma.$queryRaw`
      SELECT 
        b.id,
        b.name,
        b.slug,
        b.description,
        b.short_description,
        b.phone,
        b.email,
        b.website,
        b.street_address,
        b.city,
        b.state,
        b.zip_code,
        b.price_level,
        b.cuisine_type,
        b.is_featured,
        b.has_takeout,
        b.has_delivery,
        b.has_outdoor_seating,
        b.is_wheelchair_accessible,
        b.has_wifi,
        b.is_pet_friendly,
        b.has_parking,
        bi.url as image
      FROM businesses b
      JOIN business_categories bc ON b.id = bc.business_id
      LEFT JOIN business_images bi ON b.id = bi.business_id AND bi.is_primary = true
      WHERE bc.category_id = ${categoryId}
      AND b.is_active = true
      ORDER BY b.is_featured DESC, b.name ASC
    `;

    const serializedBusinesses = businessesWithDetails.map(business => ({
      ...business,
      id: business.id.toString(),
    }));

    return Response.json(serializedBusinesses);
  } catch (error) {
    console.error('Error fetching businesses by category:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}