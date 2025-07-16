// app/api/admin/businesses/[id]/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get individual business
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const business = await prisma.businesses.findUnique({
      where: { id },
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

    // Get business categories
    const businessCategories = await prisma.business_categories.findMany({
      where: { business_id: id },
      select: { category_id: true }
    });

    return Response.json({
      ...business,
      id: business.id.toString(),
      categories: businessCategories.map(bc => bc.category_id)
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Update business
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    
    // Extract categories from update data
    const { categories, ...businessData } = updateData;
    
    // Update business data
    const updatedBusiness = await prisma.businesses.update({
      where: { id },
      data: {
        ...businessData,
        updated_at: new Date()
      }
    });

    // Handle category relationships if provided
    if (categories && Array.isArray(categories)) {
      // Delete existing category relationships
      await prisma.business_categories.deleteMany({
        where: { business_id: id }
      });

      // Create new category relationships
      if (categories.length > 0) {
        await prisma.business_categories.createMany({
          data: categories.map(categoryId => ({
            business_id: id,
            category_id: categoryId,
            created_at: new Date()
          }))
        });
      }
    }

    return Response.json({
      ...updatedBusiness,
      id: updatedBusiness.id.toString(),
      categories
    });
  } catch (error) {
    console.error('Error updating business:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Delete business
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Delete related records first (foreign key constraints)
    await prisma.business_categories.deleteMany({
      where: { business_id: id }
    });

    await prisma.business_images.deleteMany({
      where: { business_id: id }
    });

    await prisma.business_hours.deleteMany({
      where: { business_id: id }
    });

    // Delete the business
    await prisma.businesses.delete({
      where: { id }
    });

    return Response.json({ success: true, message: 'Business deleted successfully' });
  } catch (error) {
    console.error('Error deleting business:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}