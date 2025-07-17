// app/api/admin/businesses/[id]/hours/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      return Response.json({ error: 'Business ID is required' }, { status: 400 });
    }

    // Check if business exists first
    const business = await prisma.businesses.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    const hours = await prisma.business_hours.findMany({
      where: {
        business_id: id
      },
      orderBy: {
        day_of_week: 'asc'
      }
    });

    console.log(`Found ${hours.length} hours for business ${id}`);

    // Convert all BigInt IDs to strings
    const serializedHours = hours.map(hour => ({
      ...hour,
      id: hour.id.toString(),
      business_id: hour.business_id.toString()
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
    console.log('Params:', params);
    
    const { id } = await params;
    console.log('Business ID:', id);
    
    if (!id) {
      return Response.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const requestBody = await request.json();
    console.log('Request body:', requestBody);
    
    const { hours } = requestBody;
    
    if (!hours) {
      return Response.json({ error: 'Hours data is required' }, { status: 400 });
    }

    if (!Array.isArray(hours)) {
      return Response.json({ error: 'Hours must be an array' }, { status: 400 });
    }

    // Check if business exists first
    const business = await prisma.businesses.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    console.log('Business found:', business);

    // Delete existing hours for this business
    const deleteResult = await prisma.business_hours.deleteMany({
      where: { business_id: id }
    });
    
    console.log('Deleted existing hours:', deleteResult);

    // Create new hours - only create entries for days that have data
    const hoursData = hours
      .filter(hour => hour.day_of_week !== undefined && hour.day_of_week !== null) 
      .map(hour => {
        console.log('Processing hour:', hour);
        return {
          business_id: id,
          day_of_week: parseInt(hour.day_of_week),
          open_time: (hour.is_closed || hour.is_24_hours) ? null : hour.open_time,
          close_time: (hour.is_closed || hour.is_24_hours) ? null : hour.close_time,
          is_closed: Boolean(hour.is_closed),
          is_24_hours: Boolean(hour.is_24_hours),
          created_at: new Date()
        };
      });

    console.log('Hours data to create:', hoursData);

    let createResult = null;
    if (hoursData.length > 0) {
      createResult = await prisma.business_hours.createMany({
        data: hoursData
      });
      console.log('Created hours:', createResult);
    } else {
      console.log('No hours data to create');
    }

    // Fetch and return the created hours
    const savedHours = await prisma.business_hours.findMany({
      where: { business_id: id },
      orderBy: { day_of_week: 'asc' }
    });

    console.log('Saved hours:', savedHours);

    // Convert BigInt IDs to strings
    const serializedHours = savedHours.map(hour => ({
      ...hour,
      id: hour.id.toString(),
      business_id: hour.business_id.toString()
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