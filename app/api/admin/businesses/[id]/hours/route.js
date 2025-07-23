// Fixed app/api/admin/businesses/[id]/hours/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to convert time string to Date object for today
function timeStringToDateTime(timeString) {
  if (!timeString) return null;
  
  // Create a date object for today with the specified time
  const today = new Date();
  const [hours, minutes] = timeString.split(':');
  
  const dateTime = new Date(today);
  dateTime.setHours(parseInt(hours, 10));
  dateTime.setMinutes(parseInt(minutes, 10));
  dateTime.setSeconds(0);
  dateTime.setMilliseconds(0);
  
  return dateTime;
}

// Helper function to convert DateTime back to time string
function dateTimeToTimeString(dateTime) {
  if (!dateTime) return null;
  
  const hours = dateTime.getHours().toString().padStart(2, '0');
  const minutes = dateTime.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

// Helper function to convert BigInt to string
function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

// Get business hours for admin
export async function GET(request, { params }) {
  try {
    console.log('GET business hours called for business:', params);
    const { id } = await params;

    if (!id) {
      console.error('No business ID provided');
      return Response.json({ error: 'Business ID is required' }, { status: 400 });
    }

    console.log('Looking for business with ID:', id);

    // Check if business exists first
    const business = await prisma.businesses.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!business) {
      console.error('Business not found with ID:', id);
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    console.log('Business found:', business);

    const hours = await prisma.business_hours.findMany({
      where: {
        business_id: id
      },
      orderBy: {
        day_of_week: 'asc'
      }
    });

    console.log(`Found ${hours.length} hours for business ${id}`);

    // Convert all BigInt IDs to strings and DateTime to time strings
    const serializedHours = hours.map(hour => ({
      ...hour,
      id: hour.id.toString(),
      business_id: hour.business_id.toString(),
      open_time: dateTimeToTimeString(hour.open_time),
      close_time: dateTimeToTimeString(hour.close_time)
    }));

    return Response.json(serializedHours);
  } catch (error) {
    console.error('Error fetching business hours:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
}

// Save/Update business hours for admin
export async function POST(request, { params }) {
  try {
    console.log('POST business hours called');
    console.log('Params received:', params);
    
    const { id } = await params;
    console.log('Business ID extracted:', id);
    
    if (!id) {
      console.error('No business ID provided in params');
      return Response.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const requestBody = await request.json();
    console.log('Request body received:', requestBody);
    
    const { hours } = requestBody;
    
    if (!hours) {
      console.error('No hours data provided');
      return Response.json({ error: 'Hours data is required' }, { status: 400 });
    }

    if (!Array.isArray(hours)) {
      console.error('Hours data is not an array:', typeof hours);
      return Response.json({ error: 'Hours must be an array' }, { status: 400 });
    }

    console.log('Validating business exists...');
    // Check if business exists first
    const business = await prisma.businesses.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!business) {
      console.error('Business not found with ID:', id);
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    console.log('Business found:', business);

    console.log('Deleting existing hours...');
    // Delete existing hours for this business
    const deleteResult = await prisma.business_hours.deleteMany({
      where: { business_id: id }
    });
    
    console.log('Deleted existing hours:', deleteResult);

    // Validate and prepare hours data
    const validHours = [];
    for (let i = 0; i < hours.length; i++) {
      const hour = hours[i];
      console.log(`Processing hour ${i}:`, hour);
      
      // Validate required fields
      if (typeof hour.day_of_week !== 'number' || hour.day_of_week < 0 || hour.day_of_week > 6) {
        console.error(`Invalid day_of_week for hour ${i}:`, hour.day_of_week);
        return Response.json({ 
          error: `Invalid day_of_week for hour ${i}: ${hour.day_of_week}. Must be 0-6.` 
        }, { status: 400 });
      }

      // Convert time strings to DateTime objects
      let openDateTime = null;
      let closeDateTime = null;

      if (!hour.is_closed && !hour.is_24_hours) {
        if (!hour.open_time || !hour.close_time) {
          console.error(`Missing time data for hour ${i}:`, hour);
          return Response.json({ 
            error: `Missing open_time or close_time for ${hour.day_name || `day ${hour.day_of_week}`}` 
          }, { status: 400 });
        }

        // Validate time format (HH:mm)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(hour.open_time)) {
          console.error(`Invalid open_time format for hour ${i}:`, hour.open_time);
          return Response.json({ 
            error: `Invalid open_time format for ${hour.day_name || `day ${hour.day_of_week}`}: ${hour.open_time}. Use HH:mm format.` 
          }, { status: 400 });
        }
        if (!timeRegex.test(hour.close_time)) {
          console.error(`Invalid close_time format for hour ${i}:`, hour.close_time);
          return Response.json({ 
            error: `Invalid close_time format for ${hour.day_name || `day ${hour.day_of_week}`}: ${hour.close_time}. Use HH:mm format.` 
          }, { status: 400 });
        }

        // Convert time strings to DateTime objects
        openDateTime = timeStringToDateTime(hour.open_time);
        closeDateTime = timeStringToDateTime(hour.close_time);

        console.log(`Converted times for day ${hour.day_of_week}:`, {
          original: { open: hour.open_time, close: hour.close_time },
          converted: { open: openDateTime, close: closeDateTime }
        });
      }

      // Prepare hour data
      const hourData = {
        business_id: id,
        day_of_week: parseInt(hour.day_of_week),
        open_time: openDateTime,
        close_time: closeDateTime,
        is_closed: Boolean(hour.is_closed),
        is_24_hours: Boolean(hour.is_24_hours),
        created_at: new Date()
      };

      validHours.push(hourData);
    }

    console.log('Validated hours data:', validHours);

    let createResult = null;
    if (validHours.length > 0) {
      console.log('Creating new hours...');
      createResult = await prisma.business_hours.createMany({
        data: validHours
      });
      console.log('Created hours result:', createResult);
    } else {
      console.log('No valid hours data to create');
    }

    // Fetch and return the created hours
    console.log('Fetching saved hours...');
    const savedHours = await prisma.business_hours.findMany({
      where: { business_id: id },
      orderBy: { day_of_week: 'asc' }
    });

    console.log('Saved hours fetched:', savedHours);

    // Convert BigInt IDs to strings and DateTime back to time strings
    const serializedHours = savedHours.map(hour => ({
      ...hour,
      id: hour.id.toString(),
      business_id: hour.business_id.toString(),
      open_time: dateTimeToTimeString(hour.open_time),
      close_time: dateTimeToTimeString(hour.close_time)
    }));

    return Response.json({
      success: true,
      message: 'Business hours saved successfully',
      created: createResult?.count || 0,
      hours: serializedHours
    });
  } catch (error) {
    console.error('Error saving business hours:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack,
      code: error.code
    }, { status: 500 });
  }
}

// Update business hours for admin
export async function PUT(request, { params }) {
  // Use the same logic as POST for simplicity
  return POST(request, { params });
}

// Delete business hours for admin
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
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
}