// Update your app/api/neighborhoods/route.js file with this content:

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
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
        slug: true,        // Add this line - this was missing!
        description: true,
        // Note: Your neighborhoods table doesn't have an image field
        // You might need to add one or use a default image
      }
    });

    // Convert BigInt fields to strings and add placeholder images
    const serializedNeighborhoods = neighborhoods.map(neighborhood => ({
      ...neighborhood,
      id: neighborhood.id.toString(),
      // Add a placeholder image since your schema doesn't have an image field
      image: `https://via.placeholder.com/325x375/355E3B/white?text=${encodeURIComponent(neighborhood.name)}`
    }));

    console.log('Neighborhoods API returning:', serializedNeighborhoods); // Debug log

    return Response.json(serializedNeighborhoods);
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}