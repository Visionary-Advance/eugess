// app/api/neighborhoods/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Fetching neighborhoods...');
    
    const neighborhoods = await prisma.neighborhoods.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image_url: true, // ✅ UNCOMMENTED - This will now include the image URLs
        center_lat: true, // Optional: include coordinates if needed
        center_lng: true, // Optional: include coordinates if needed
      }
    });

    console.log('Raw neighborhoods from DB:', neighborhoods);
    console.log('First neighborhood with image_url:', neighborhoods[0]);

    // Convert BigInt fields to strings if needed
    const serializedNeighborhoods = neighborhoods.map(neighborhood => ({
      ...neighborhood,
      id: neighborhood.id.toString(),
      // Convert Decimal coordinates to numbers if they exist
      center_lat: neighborhood.center_lat ? parseFloat(neighborhood.center_lat.toString()) : null,
      center_lng: neighborhood.center_lng ? parseFloat(neighborhood.center_lng.toString()) : null,
    }));

    console.log('Serialized neighborhoods with images:', serializedNeighborhoods);
    console.log('Image URLs being returned:', serializedNeighborhoods.map(n => ({ name: n.name, image_url: n.image_url })));

    return Response.json(serializedNeighborhoods);
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
}