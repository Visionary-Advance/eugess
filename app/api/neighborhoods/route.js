// app/api/neighborhoods/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Fetching neighborhoods...');
    
    // First, let's try without image_url to see if that's the issue
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
        // image_url: true, // Comment this out temporarily
      }
    });

    console.log('Raw neighborhoods from DB:', neighborhoods);

    // Convert BigInt fields to strings
    const serializedNeighborhoods = neighborhoods.map(neighborhood => ({
      ...neighborhood,
      id: neighborhood.id.toString(),
    }));

    console.log('Serialized neighborhoods:', serializedNeighborhoods);

    return Response.json(serializedNeighborhoods);
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
}