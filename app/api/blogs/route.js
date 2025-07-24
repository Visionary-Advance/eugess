// app/api/blogs/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const category = searchParams.get('category');

    let whereClause = {
      is_published: true
    };

    if (featured === 'true') {
      whereClause.is_featured = true;
    }

    if (category) {
      whereClause.category = category;
    }

    const blogs = await prisma.blogs.findMany({
      where: whereClause,
      orderBy: [
        { is_featured: 'desc' },
        { publish_date: 'desc' }
      ],
      take: limit ? parseInt(limit) : undefined,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        author_name: true,
        category: true,
        read_time_minutes: true,
        view_count: true,
        is_featured: true,
        publish_date: true,
        created_at: true
      }
    });

    const serializedBlogs = blogs.map(blog => ({
      ...blog,
      id: blog.id.toString(),
    }));

    return Response.json(serializedBlogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// For admin: Create new blog
export async function POST(request) {
  try {
    const blogData = await request.json();
    
    // Generate slug from title
    const slug = blogData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const newBlog = await prisma.blogs.create({
      data: {
        ...blogData,
        slug,
        publish_date: blogData.is_published ? new Date() : null,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return Response.json({
      ...newBlog,
      id: newBlog.id.toString()
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}