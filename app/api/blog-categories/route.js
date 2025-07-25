// app/api/blog-categories/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.blog_categories.findMany({
      where: {
        is_active: true
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true
      }
    });

    return Response.json(categories);
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Optional: Add POST method to create new categories from admin
export async function POST(request) {
  try {
    const categoryData = await request.json();
    
    // Generate slug from name
    const slug = categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const newCategory = await prisma.blog_categories.create({
      data: {
        name: categoryData.name,
        slug,
        description: categoryData.description || null,
        color: categoryData.color || '#355E3B',
        is_active: categoryData.is_active !== false, // Default to true
        created_at: new Date()
      }
    });

    return Response.json(newCategory);
  } catch (error) {
    console.error('Error creating blog category:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}