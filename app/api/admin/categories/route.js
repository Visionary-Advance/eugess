// app/api/admin/categories/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all categories for admin
export async function GET() {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: {
        sort_order: 'asc'
      }
    });

    // Get business count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const [countResult] = await prisma.$queryRaw`
          SELECT COUNT(*) as count
          FROM business_categories bc
          JOIN businesses b ON bc.business_id = b.id
          WHERE bc.category_id = ${category.id}
          AND b.is_active = true
        `;

        return {
          ...category,
          id: category.id.toString(),
          businessCount: Number(countResult.count)
        };
      })
    );

    return Response.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Create new category
export async function POST(request) {
  try {
    const categoryData = await request.json();
    
    const newCategory = await prisma.categories.create({
      data: {
        ...categoryData,
        slug: categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return Response.json({
      ...newCategory,
      id: newCategory.id.toString()
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}