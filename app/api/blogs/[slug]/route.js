// app/api/blogs/[slug]/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    
    const blog = await prisma.blogs.findFirst({
      where: { 
        slug: slug,
        is_published: true 
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        featured_image: true,
        author_name: true,
        category: true,
        tags: true,
        read_time_minutes: true,
        view_count: true,
        is_featured: true,
        publish_date: true,
        meta_title: true,
        meta_description: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!blog) {
      return Response.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.blogs.update({
      where: { id: blog.id },
      data: { view_count: (blog.view_count || 0) + 1 }
    });

    return Response.json({
      ...blog,
      id: blog.id.toString(),
      view_count: (blog.view_count || 0) + 1
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}