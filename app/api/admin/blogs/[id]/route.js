// app/api/admin/blogs/[id]/route.js - Fixed version
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client with error handling
let prisma;
try {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty',
  });
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  throw error;
}

// Get individual blog for admin
export async function GET(request, { params }) {
  try {
    // Ensure params are properly awaited
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    if (!id) {
      return Response.json({ error: 'Blog ID is required' }, { status: 400 });
    }

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

    // Handle BigInt serialization
    const serializedBlog = {
      ...blog,
      id: blog.id.toString(),
      view_count: blog.view_count || 0,
      read_time_minutes: blog.read_time_minutes || 5
    };

    return Response.json(serializedBlog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Update blog
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    if (!id) {
      return Response.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    const updateData = await request.json();
    
    // Validate required fields
    if (updateData.title && typeof updateData.title !== 'string') {
      return Response.json({ error: 'Invalid title format' }, { status: 400 });
    }
    
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
    
    // Ensure numeric fields are proper types
    if (updateData.read_time_minutes !== undefined) {
      updateData.read_time_minutes = parseInt(updateData.read_time_minutes) || 5;
    }
    if (updateData.view_count !== undefined) {
      updateData.view_count = parseInt(updateData.view_count) || 0;
    }
    
    const updatedBlog = await prisma.blogs.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    const serializedBlog = {
      ...updatedBlog,
      id: updatedBlog.id.toString()
    };

    return Response.json(serializedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    
    if (error.code === 'P2025') {
      return Response.json({ error: 'Blog not found' }, { status: 404 });
    }
    
    if (error.code === 'P2002') {
      return Response.json({ error: 'Blog with this slug already exists' }, { status: 409 });
    }
    
    return Response.json({ 
      error: 'Failed to update blog',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Delete blog
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    if (!id) {
      return Response.json({ error: 'Blog ID is required' }, { status: 400 });
    }
    
    await prisma.blogs.delete({
      where: { id }
    });

    return Response.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    
    if (error.code === 'P2025') {
      return Response.json({ error: 'Blog not found' }, { status: 404 });
    }
    
    return Response.json({ 
      error: 'Failed to delete blog',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}