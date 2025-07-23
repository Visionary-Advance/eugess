// app/api/businesses/neighborhood/[slug]/route.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    console.log('=== Neighborhood Businesses API Called (by slug) ===');
    
    const { slug } = await params;
    console.log('Extracted neighborhood slug:', slug);

    if (!slug) {
      console.error('No neighborhood slug provided');
      return Response.json({ error: 'Neighborhood slug is required' }, { status: 400 });
    }

    // Find neighborhood by slug
    console.log('Looking up neighborhood by slug...');
    const neighborhood = await prisma.neighborhoods.findFirst({
      where: { 
        slug: slug,
        is_active: true 
      },
      select: { id: true, name: true, slug: true }
    });

    console.log('Neighborhood lookup result:', neighborhood);

    if (!neighborhood) {
      console.error('Neighborhood not found with slug:', slug);
      return Response.json({ error: `Neighborhood not found with slug: ${slug}` }, { status: 404 });
    }

    console.log('Neighborhood found, fetching businesses...');

    // Fetch businesses in this neighborhood using the neighborhood ID
    const businesses = await prisma.businesses.findMany({
      where: {
        neighborhood_id: neighborhood.id,
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
        created_at: true
      },
      orderBy: [
        { is_featured: 'desc' },
        { name: 'asc' }
      ]
    });

    console.log(`Found ${businesses.length} businesses for neighborhood ${slug} (ID: ${neighborhood.id})`);

    // Convert BigInt IDs to strings
    const serializedBusinesses = businesses.map(business => ({
      ...business,
      id: business.id.toString(),
    }));

    console.log('Returning serialized businesses:', serializedBusinesses.length);

    return Response.json(serializedBusinesses);
  } catch (error) {
    console.error('Error fetching businesses by neighborhood slug:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}