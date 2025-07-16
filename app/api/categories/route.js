// app/api/categories/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get active categories with business counts
    const categoriesWithCounts = await prisma.categories.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        sort_order: 'asc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
      }
    });

    // Get business counts for each category
    const categoriesWithBusinessCounts = await Promise.all(
      categoriesWithCounts.map(async (category) => {
        const businessCount = await prisma.business_categories.count({
          where: {
            category_id: category.id,
            // Only count businesses that are active
            // We need to join with businesses table to check is_active
          }
        });

        // Get actual count with active business filter using raw query
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

    return Response.json(categoriesWithBusinessCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}