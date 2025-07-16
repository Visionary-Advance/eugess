// app/api/admin/businesses/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all businesses for admin
export async function GET() {
  try {
    const businesses = await prisma.businesses.findMany({
      orderBy: {
        created_at: 'desc'
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
        cuisine_type: true, // Add this field
        is_active: true,
        is_featured: true,
        is_verified: true,
        created_at: true,
        updated_at: true
      }
    });

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

// Create new business
export async function POST(request) {
  try {
    const businessData = await request.json();
    
    // Extract categories from business data
    const { categories, ...businessFields } = businessData;
    
    const newBusiness = await prisma.businesses.create({
      data: {
        ...businessFields,
        slug: businessFields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Handle category relationships if provided
    if (categories && Array.isArray(categories) && categories.length > 0) {
      await prisma.business_categories.createMany({
        data: categories.map(categoryId => ({
          business_id: newBusiness.id,
          category_id: categoryId,
          created_at: new Date()
        }))
      });
    }

    return Response.json({
      ...newBusiness,
      id: newBusiness.id.toString(),
      categories
    });
  } catch (error) {
    console.error('Error creating business:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}