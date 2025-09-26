// app/api/admin/blogs/route.js - Fixed version
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

// Get all blogs for admin (including unpublished)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const search = searchParams.get('search');
    
    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { author_name: { contains: search, mode: 'insensitive' } }
      ]
    } : {};
    
    const blogs = await prisma.blogs.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
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

    // Serialize BigInt fields to strings
    const serializedBlogs = blogs.map(blog => ({
      ...blog,
      id: blog.id.toString(),
      view_count: blog.view_count || 0,
      read_time_minutes: blog.read_time_minutes || 5
    }));

    return Response.json(serializedBlogs);
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    return Response.json({ 
      error: 'Failed to fetch blogs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Create new blog
export async function POST(request) {
  try {
    const blogData = await request.json();
    
    // Validate required fields
    if (!blogData.title || typeof blogData.title !== 'string') {
      return Response.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Generate slug from title
    const slug = blogData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Prepare data for creation
    const createData = {
      title: blogData.title,
      slug,
      content: blogData.content || '',
      excerpt: blogData.excerpt || '',
      featured_image: blogData.featured_image || null,
      author_name: blogData.author_name || null,
      author_id: blogData.author_id || null,
      category: blogData.category || null,
      tags: blogData.tags || null,
      read_time_minutes: parseInt(blogData.read_time_minutes) || 5,
      view_count: 0,
      is_published: Boolean(blogData.is_published),
      is_featured: Boolean(blogData.is_featured),
      publish_date: blogData.is_published ? new Date() : null,
      meta_title: blogData.meta_title || null,
      meta_description: blogData.meta_description || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const newBlog = await prisma.blogs.create({
      data: createData
    });

    const serializedBlog = {
      ...newBlog,
      id: newBlog.id.toString()
    };

    return Response.json(serializedBlog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    
    if (error.code === 'P2002') {
      return Response.json({ error: 'Blog with this slug already exists' }, { status: 409 });
    }
    
    return Response.json({ 
      error: 'Failed to create blog',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}