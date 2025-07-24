// app/api/admin/blogs/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all blogs for admin (including unpublished)
export async function GET() {
  try {
    const blogs = await prisma.blogs.findMany({
      orderBy: {
        created_at: 'desc'
      },
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
        is_published: true,
        is_featured: true,
        publish_date: true,
        created_at: true,
        updated_at: true
      }
    });

    const serializedBlogs = blogs.map(blog => ({
      ...blog,
      id: blog.id.toString(),
    }));

    return Response.json(serializedBlogs);
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}