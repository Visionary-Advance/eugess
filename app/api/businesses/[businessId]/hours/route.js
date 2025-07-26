// app/api/businesses/[businessId]/hours/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to convert MySQL TIME back to time string
function mySQLTimeToTimeString(mysqlTime) {
  if (!mysqlTime) return null;
  
  // Handle different possible formats
  if (typeof mysqlTime === 'string') {
    // If it's already in HH:mm or HH:mm:ss format
    if (mysqlTime.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
      return mysqlTime.substring(0, 5); // Return HH:mm format
    }
  }
  
  // If it's a Date object (shouldn't happen with TIME fields, but just in case)
  if (mysqlTime instanceof Date) {
    const hours = mysqlTime.getHours().toString().padStart(2, '0');
    const minutes = mysqlTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // If it's a time string from MySQL TIME field
  try {
    // MySQL TIME fields often return as "HH:mm:ss" strings
    const timeStr = mysqlTime.toString();
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  } catch (error) {
    console.warn('Could not parse MySQL time:', mysqlTime);
  }
  
  return null;
}

export async function GET(request, { params }) {
  try {
    const { businessId } = await params;

    if (!businessId) {
      return Response.json({ error: 'Business ID is required' }, { status: 400 });
    }

    // Check if business exists and is active
    const business = await prisma.businesses.findUnique({
      where: { 
        id: businessId,
        is_active: true 
      },
      select: { id: true, name: true }
    });

    if (!business) {
      return Response.json({ error: 'Business not found or inactive' }, { status: 404 });
    }

    // Use raw SQL to avoid timezone conversion issues
    const hours = await prisma.$queryRaw`
      SELECT day_of_week,
             TIME_FORMAT(open_time, '%H:%i') as open_time,
             TIME_FORMAT(close_time, '%H:%i') as close_time,
             is_closed, is_24_hours
      FROM business_hours
      WHERE business_id = ${businessId}
      ORDER BY day_of_week ASC
    `;

    // Convert to public format - no conversion needed
    const publicHours = hours.map(hour => ({
      day_of_week: hour.day_of_week,
      open_time: hour.open_time, // Already formatted as HH:mm
      close_time: hour.close_time, // Already formatted as HH:mm
      is_closed: Boolean(hour.is_closed),
      is_24_hours: Boolean(hour.is_24_hours)
    }));

    console.log('Public API returning hours:', publicHours);

    return Response.json(publicHours);
  } catch (error) {
    console.error('Error fetching business hours:', error);
    return Response.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}