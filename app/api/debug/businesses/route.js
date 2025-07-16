// app/api/debug/businesses/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const businesses = await prisma.businesses.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        is_active: true,
      },
      take: 10 // Just get first 10 for debugging
    });

    return Response.json({
      total: businesses.length,
      businesses: businesses.map(b => ({
        ...b,
        id: b.id.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching businesses for debug:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}