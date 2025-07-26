
// app/api/admin/businesses/[id]/hours/route.js
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

// Get business hours
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json({ error: 'Business ID is required' }, { status: 400 });
    }

    // Check if business exists
    const business = await prisma.businesses.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    // Use raw SQL to get hours without timezone conversion
    const hours = await prisma.$queryRaw`
      SELECT id, business_id, day_of_week,
             TIME_FORMAT(open_time, '%H:%i') as open_time,
             TIME_FORMAT(close_time, '%H:%i') as close_time,
             is_closed, is_24_hours, created_at
      FROM business_hours
      WHERE business_id = ${id}
      ORDER BY day_of_week ASC
    `;

    // Convert BigInt IDs to strings
    const serializedHours = hours.map(hour => ({
      id: hour.id.toString(),
      business_id: hour.business_id.toString(),
      day_of_week: hour.day_of_week,
      open_time: hour.open_time, // Already formatted as HH:mm
      close_time: hour.close_time, // Already formatted as HH:mm
      is_closed: Boolean(hour.is_closed),
      is_24_hours: Boolean(hour.is_24_hours),
      created_at: hour.created_at
    }));

    return Response.json(serializedHours);
  } catch (error) {
    console.error('Error fetching business hours:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// Save/Update business hours
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return Response.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const requestBody = await request.json();
    const { hours } = requestBody;
    
    if (!hours || !Array.isArray(hours)) {
      return Response.json({ error: 'Hours data must be an array' }, { status: 400 });
    }

    // Check if business exists
    const business = await prisma.businesses.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    // Validate hours data
    const validationErrors = [];
    const validatedHours = [];

    for (let i = 0; i < hours.length; i++) {
      const hour = hours[i];
      
      // Validate day_of_week
      if (typeof hour.day_of_week !== 'number' || hour.day_of_week < 0 || hour.day_of_week > 6) {
        validationErrors.push(`Invalid day_of_week for hour ${i}: ${hour.day_of_week}. Must be 0-6.`);
        continue;
      }

      // Validate time formats if not closed and not 24 hours
      if (!hour.is_closed && !hour.is_24_hours) {
        if (hour.open_time && hour.close_time) {
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          
          if (!timeRegex.test(hour.open_time)) {
            validationErrors.push(`Invalid open_time format for day ${hour.day_of_week}. Use HH:mm format.`);
            continue;
          }
          
          if (!timeRegex.test(hour.close_time)) {
            validationErrors.push(`Invalid close_time format for day ${hour.day_of_week}. Use HH:mm format.`);
            continue;
          }

          // Check if closing time is after opening time
          const openMinutes = timeStringToMinutes(hour.open_time);
          const closeMinutes = timeStringToMinutes(hour.close_time);
          if (openMinutes >= closeMinutes) {
            validationErrors.push(`Closing time must be after opening time for day ${hour.day_of_week}.`);
            continue;
          }
        } else {
          validationErrors.push(`Open time and close time are required for day ${hour.day_of_week} when not closed or 24 hours.`);
          continue;
        }
      }

      validatedHours.push(hour);
    }

    if (validationErrors.length > 0) {
      return Response.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 });
    }

    // Use transaction with raw SQL to handle TIME fields properly
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing hours for this business
      await tx.business_hours.deleteMany({
        where: { business_id: id }
      });

      // Insert new hours using raw SQL to properly handle TIME fields
      const insertPromises = validatedHours.map(hour => {
        const openTime = (!hour.is_closed && !hour.is_24_hours && hour.open_time) ? hour.open_time : null;
        const closeTime = (!hour.is_closed && !hour.is_24_hours && hour.close_time) ? hour.close_time : null;
        
        // Debug logging
        console.log(`Inserting hours for day ${hour.day_of_week}:`, {
          openTime,
          closeTime,
          is_closed: hour.is_closed,
          is_24_hours: hour.is_24_hours,
          original_open: hour.open_time,
          original_close: hour.close_time
        });
        
        return tx.$executeRaw`
          INSERT INTO business_hours (
            id, business_id, day_of_week, open_time, close_time, 
            is_closed, is_24_hours, created_at
          ) VALUES (
            UUID(), ${id}, ${hour.day_of_week}, ${openTime}, ${closeTime},
            ${hour.is_closed}, ${hour.is_24_hours}, NOW()
          )
        `;
      });

      await Promise.all(insertPromises);

      // Fetch the saved hours using raw SQL to avoid timezone conversion
      const rawHours = await tx.$queryRaw`
        SELECT id, business_id, day_of_week, 
               TIME_FORMAT(open_time, '%H:%i') as open_time,
               TIME_FORMAT(close_time, '%H:%i') as close_time,
               is_closed, is_24_hours, created_at
        FROM business_hours 
        WHERE business_id = ${id}
        ORDER BY day_of_week ASC
      `;

      console.log('Raw hours from database:', rawHours);

      return { savedHours: rawHours, insertedCount: validatedHours.length };
    });

    // Serialize the response - no conversion needed since we used TIME_FORMAT
    const serializedHours = result.savedHours.map(hour => ({
      id: hour.id.toString(),
      business_id: hour.business_id.toString(),
      day_of_week: hour.day_of_week,
      open_time: hour.open_time, // Already formatted as HH:mm
      close_time: hour.close_time, // Already formatted as HH:mm
      is_closed: Boolean(hour.is_closed),
      is_24_hours: Boolean(hour.is_24_hours),
      created_at: hour.created_at
    }));

    return Response.json({
      success: true,
      message: 'Business hours saved successfully',
      created: result.insertedCount,
      hours: serializedHours
    });

  } catch (error) {
    console.error('Error saving business hours:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to convert time string to minutes for comparison
function timeStringToMinutes(timeString) {
  if (!timeString) return 0;
  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

// Update business hours (alias for POST)
export async function PUT(request, { params }) {
  return POST(request, { params });
}

// Delete business hours
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const deleteResult = await prisma.business_hours.deleteMany({
      where: { business_id: id }
    });

    return Response.json({
      success: true,
      message: 'Business hours deleted successfully',
      deletedCount: deleteResult.count
    });
  } catch (error) {
    console.error('Error deleting business hours:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}