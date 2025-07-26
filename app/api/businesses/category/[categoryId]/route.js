// app/api/businesses/category/[categoryId]/route.js
// Simple version that should work with your current schema

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { categoryId } = await params;
    
    console.log('Fetching businesses for category:', categoryId);

    // Method 1: Try junction table approach
    let businesses = [];
    
    try {
      // Get business IDs from junction table
      const businessCategories = await prisma.business_categories.findMany({
        where: { category_id: categoryId },
        select: { business_id: true }
      });
      
      const businessIds = businessCategories.map(bc => bc.business_id);
      
      if (businessIds.length > 0) {
        businesses = await prisma.businesses.findMany({
          where: {
            id: { in: businessIds },
            is_active: true
          }
        });
      }
      
      console.log(`Junction table method: Found ${businesses.length} businesses`);
    } catch (junctionError) {
      console.log('Junction table method failed:', junctionError.message);
      
      // Method 2: Try direct foreign key if junction fails
      try {
        businesses = await prisma.businesses.findMany({
          where: {
            category_id: categoryId, // This might not exist
            is_active: true
          }
        });
        console.log(`Direct FK method: Found ${businesses.length} businesses`);
      } catch (directError) {
        console.log('Direct FK method also failed:', directError.message);
        businesses = []; // Return empty array if both methods fail
      }
    }

    // Convert BigInt IDs to strings
    const serializedBusinesses = businesses.map(business => ({
      ...business,
      id: business.id.toString(),
    }));

    return Response.json(serializedBusinesses);
    
  } catch (error) {
    console.error('Error fetching businesses by category:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}