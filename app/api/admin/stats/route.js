// app/api/admin/stats/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get basic counts
    const [totalBusinesses, totalCategories, activeBusinesses, featuredBusinesses] = await Promise.all([
      prisma.businesses.count(),
      prisma.categories.count(),
      prisma.businesses.count({ where: { is_active: true } }),
      prisma.businesses.count({ where: { is_featured: true } })
    ]);

    // Get businesses by category
    const businessesByCategory = await prisma.$queryRaw`
      SELECT 
        c.name as category_name,
        COUNT(bc.business_id) as business_count
      FROM categories c
      LEFT JOIN business_categories bc ON c.id = bc.category_id
      LEFT JOIN businesses b ON bc.business_id = b.id AND b.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY business_count DESC
    `;

    // Get recent businesses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBusinesses = await prisma.businesses.count({
      where: {
        created_at: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get businesses by city
    const businessesByCity = await prisma.$queryRaw`
      SELECT 
        city,
        COUNT(*) as business_count
      FROM businesses
      WHERE is_active = true AND city IS NOT NULL
      GROUP BY city
      ORDER BY business_count DESC
      LIMIT 10
    `;

    // Get businesses with features
    const featuresStats = await prisma.$queryRaw`
      SELECT 
        SUM(CASE WHEN has_takeout = true THEN 1 ELSE 0 END) as takeout_count,
        SUM(CASE WHEN has_delivery = true THEN 1 ELSE 0 END) as delivery_count,
        SUM(CASE WHEN has_outdoor_seating = true THEN 1 ELSE 0 END) as outdoor_seating_count,
        SUM(CASE WHEN is_wheelchair_accessible = true THEN 1 ELSE 0 END) as wheelchair_accessible_count,
        SUM(CASE WHEN has_wifi = true THEN 1 ELSE 0 END) as wifi_count,
        SUM(CASE WHEN is_pet_friendly = true THEN 1 ELSE 0 END) as pet_friendly_count,
        SUM(CASE WHEN has_parking = true THEN 1 ELSE 0 END) as parking_count
      FROM businesses
      WHERE is_active = true
    `;

    return Response.json({
      totalBusinesses,
      totalCategories,
      activeBusinesses,
      featuredBusinesses,
      recentBusinesses,
      businessesByCategory: businessesByCategory.map(item => ({
        ...item,
        business_count: Number(item.business_count)
      })),
      businessesByCity: businessesByCity.map(item => ({
        ...item,
        business_count: Number(item.business_count)
      })),
      featuresStats: featuresStats[0] ? {
        takeout: Number(featuresStats[0].takeout_count),
        delivery: Number(featuresStats[0].delivery_count),
        outdoorSeating: Number(featuresStats[0].outdoor_seating_count),
        wheelchairAccessible: Number(featuresStats[0].wheelchair_accessible_count),
        wifi: Number(featuresStats[0].wifi_count),
        petFriendly: Number(featuresStats[0].pet_friendly_count),
        parking: Number(featuresStats[0].parking_count)
      } : {}
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}