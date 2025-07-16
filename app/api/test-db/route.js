import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Try to get table names
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    
    return Response.json({ 
      status: 'connected', 
      test: result,
      tables: tables 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return Response.json({ 
      error: error.message,
      code: error.code 
    }, { status: 500 });
  }
}