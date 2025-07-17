// app/api/debug/business-hours/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to convert BigInt to string
function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function GET() {
  try {
    // Test basic Prisma connection with simple query
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Check business_hours table structure using SHOW COLUMNS
    const tableStructure = await prisma.$queryRaw`SHOW COLUMNS FROM business_hours`;
    
    // Get sample business
    const sampleBusiness = await prisma.businesses.findFirst({
      select: { id: true, name: true }
    });
    
    // Check if any business hours exist
    const hourCount = await prisma.business_hours.count();
    
    // Test if we can query business_hours table
    const sampleHours = await prisma.business_hours.findMany({
      take: 3,
      select: {
        id: true,
        business_id: true,
        day_of_week: true,
        is_closed: true,
        is_24_hours: true
      }
    });
    
    // Serialize all data to handle BigInt
    const responseData = {
      success: true,
      testQuery: serializeBigInt(testQuery),
      tableStructure: serializeBigInt(tableStructure),
      sampleBusiness,
      totalHoursRecords: hourCount,
      sampleHours: sampleHours.map(hour => ({
        ...hour,
        id: hour.id.toString(),
        business_id: hour.business_id.toString()
      }))
    };
    
    return Response.json(responseData);
    
  } catch (error) {
    console.error('Debug GET Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack,
      code: error.code
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('=== DEBUG: Business Hours API Called ===');
    
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { businessId, hours } = body;
    
    if (!businessId) {
      return Response.json({ 
        error: 'businessId is required',
        received: { businessId, hours }
      }, { status: 400 });
    }
    
    if (!hours || !Array.isArray(hours)) {
      return Response.json({ 
        error: 'hours must be an array',
        received: { businessId, hours, hoursType: typeof hours }
      }, { status: 400 });
    }
    
    // Check if business exists
    const business = await prisma.businesses.findUnique({
      where: { id: businessId },
      select: { id: true, name: true }
    });
    
    if (!business) {
      return Response.json({ 
        error: 'Business not found',
        businessId: businessId
      }, { status: 404 });
    }
    
    console.log('Business found:', business);
    
    // Validate hours data
    const validatedHours = hours.map((hour, index) => {
      console.log(`Validating hour ${index}:`, hour);
      
      if (typeof hour.day_of_week !== 'number' || hour.day_of_week < 0 || hour.day_of_week > 6) {
        throw new Error(`Invalid day_of_week for hour ${index}: ${hour.day_of_week}`);
      }
      
      return {
        business_id: businessId,
        day_of_week: hour.day_of_week,
        open_time: hour.is_closed || hour.is_24_hours ? null : hour.open_time,
        close_time: hour.is_closed || hour.is_24_hours ? null : hour.close_time,
        is_closed: Boolean(hour.is_closed),
        is_24_hours: Boolean(hour.is_24_hours),
        created_at: new Date()
      };
    });
    
    console.log('Validated hours:', validatedHours);
    
    return Response.json({
      success: true,
      message: 'Debug check passed',
      data: {
        business,
        validatedHours
      }
    });
    
  } catch (error) {
    console.error('Debug API Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 });
  }
}