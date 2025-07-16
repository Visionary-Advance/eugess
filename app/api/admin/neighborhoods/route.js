// app/api/admin/neighborhoods/route.js
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
        description: true,
      }
    });

    const serializedNeighborhoods = neighborhoods.map(neighborhood => ({
      ...neighborhood,
      id: neighborhood.id.toString(),
    }));

    return Response.json(serializedNeighborhoods);
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}