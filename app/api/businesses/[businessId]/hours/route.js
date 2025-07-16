import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { businessId } = await params;

    const hours = await prisma.business_hours.findMany({
      where: {
        business_id: businessId
      },
      orderBy: {
        day_of_week: 'asc'
      }
    });

    return Response.json(hours.map(hour => ({
      ...hour,
      id: hour.id.toString()
    })));
  } catch (error) {
    console.error('Error fetching business hours:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}