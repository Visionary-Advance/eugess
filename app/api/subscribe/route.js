// app/api/subscribe/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, source } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if email already exists
    const existingSubscriber = await prisma.email_subscribers.findUnique({
      where: { email: email }
    });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'unsubscribed') {
        // Reactivate unsubscribed user
        await prisma.email_subscribers.update({
          where: { email: email },
          data: {
            status: 'active',
            updated_at: new Date()
          }
        });
        return Response.json({ message: 'Welcome back! You\'re now subscribed again.' }, { status: 200 });
      } else {
        return Response.json({ message: 'Email already subscribed' }, { status: 200 });
      }
    }

    // Add new subscriber
    const newSubscriber = await prisma.email_subscribers.create({
      data: {
        email: email,
        source: source || 'community_signup',
        status: 'active',
        subscribed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return Response.json({ 
      message: 'Successfully subscribed!',
      subscriber: {
        id: newSubscriber.id,
        email: newSubscriber.email
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding subscriber to database:', error);
    return Response.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

// GET route for admin dashboard
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    let whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause.email = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get subscribers with pagination
    const [subscribers, total] = await Promise.all([
      prisma.email_subscribers.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip: skip,
        take: limit,
        select: {
          id: true,
          email: true,
          source: true,
          status: true,
          subscribed_at: true,
          created_at: true,
          updated_at: true
        }
      }),
      prisma.email_subscribers.count({ where: whereClause })
    ]);

    // Get stats
    const stats = await prisma.email_subscribers.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const subscriberStats = {
      total: total,
      active: stats.find(s => s.status === 'active')?._count.status || 0,
      unsubscribed: stats.find(s => s.status === 'unsubscribed')?._count.status || 0
    };

    return Response.json({
      subscribers: subscribers.map(sub => ({
        ...sub,
        id: sub.id.toString()
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: subscriberStats
    });

  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return Response.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}