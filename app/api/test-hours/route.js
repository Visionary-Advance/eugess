// app/api/test-hours/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { businessId } = await request.json();
    
    console.log('Testing business hours for business:', businessId);
    
    // Sample hours data
    const testHours = [
      {
        day_of_week: 0, // Sunday
        is_closed: true,
        is_24_hours: false,
        open_time: null,
        close_time: null
      },
      {
        day_of_week: 1, // Monday
        is_closed: false,
        is_24_hours: false,
        open_time: '09:00',
        close_time: '17:00'
      },
      {
        day_of_week: 2, // Tuesday
        is_closed: false,
        is_24_hours: false,
        open_time: '09:00',
        close_time: '17:00'
      },
      {
        day_of_week: 3, // Wednesday
        is_closed: false,
        is_24_hours: false,
        open_time: '09:00',
        close_time: '17:00'
      },
      {
        day_of_week: 4, // Thursday
        is_closed: false,
        is_24_hours: false,
        open_time: '09:00',
        close_time: '17:00'
      },
      {
        day_of_week: 5, // Friday
        is_closed: false,
        is_24_hours: false,
        open_time: '09:00',
        close_time: '17:00'
      },
      {
        day_of_week: 6, // Saturday
        is_closed: false,
        is_24_hours: false,
        open_time: '10:00',
        close_time: '16:00'
      }
    ];
    
    // Delete existing hours
    await prisma.business_hours.deleteMany({
      where: { business_id: businessId }
    });
    
    // Create new hours
    const hoursData = testHours.map(hour => ({
      business_id: businessId,
      day_of_week: hour.day_of_week,
      open_time: hour.is_closed || hour.is_24_hours ? null : hour.open_time,
      close_time: hour.is_closed || hour.is_24_hours ? null : hour.close_time,
      is_closed: Boolean(hour.is_closed),
      is_24_hours: Boolean(hour.is_24_hours),
      created_at: new Date()
    }));
    
    const result = await prisma.business_hours.createMany({
      data: hoursData
    });
    
    // Fetch the created hours
    const savedHours = await prisma.business_hours.findMany({
      where: { business_id: businessId },
      orderBy: { day_of_week: 'asc' }
    });
    
    return Response.json({
      success: true,
      message: 'Test hours created successfully',
      created: result.count,
      hours: savedHours
    });
    
  } catch (error) {
    console.error('Test hours error:', error);
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get a sample business to test with
    const business = await prisma.businesses.findFirst({
      select: { id: true, name: true }
    });
    
    if (!business) {
      return Response.json({
        error: 'No businesses found. Please create a business first.'
      }, { status: 404 });
    }
    
    // Check existing hours for this business
    const existingHours = await prisma.business_hours.findMany({
      where: { business_id: business.id },
      orderBy: { day_of_week: 'asc' }
    });
    
    return Response.json({
      success: true,
      business,
      existingHours,
      instructions: 'POST to this endpoint with {"businessId": "' + business.id + '"} to create test hours'
    });
    
  } catch (error) {
    console.error('Test hours GET error:', error);
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}