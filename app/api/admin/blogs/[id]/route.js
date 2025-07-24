// app/api/admin/blogs/[id]/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get individual blog for admin
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const blog = await prisma.blogs.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        featured_image: true,
        author_name: true,
        author_id: true,
        category: true,
        tags: true,
        read_time_minutes: true,
        view_count: true,
        is_published: true,
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

    return Response.json({
      ...blog,
      id: blog.id.toString()
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Update blog
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    
    // Auto-generate slug from title if title is being updated
    if (updateData.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Set publish date if being published for the first time
    if (updateData.is_published && !updateData.publish_date) {
      updateData.publish_date = new Date();
    }
    
    const updatedBlog = await prisma.blogs.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return Response.json({
      ...updatedBlog,
      id: updatedBlog.id.toString()
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Delete blog
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    await prisma.blogs.delete({
      where: { id }
    });

    return Response.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}