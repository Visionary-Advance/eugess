// app/api/admin/categories/[id]/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get individual category
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const category = await prisma.categories.findUnique({
      where: { id }
    });

    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get business count for this category
    const [countResult] = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM business_categories bc
      JOIN businesses b ON bc.business_id = b.id
      WHERE bc.category_id = ${id}
      AND b.is_active = true
    `;

    return Response.json({
      ...category,
      id: category.id.toString(),
      businessCount: Number(countResult.count)
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Update category
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    
    // Auto-generate slug from name if name is being updated
    if (updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    const updatedCategory = await prisma.categories.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return Response.json({
      ...updatedCategory,
      id: updatedCategory.id.toString()
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Delete category
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Check if category has businesses
    const businessCount = await prisma.business_categories.count({
      where: { category_id: id }
    });

    if (businessCount > 0) {
      return Response.json({ 
        error: `Cannot delete category. It has ${businessCount} associated businesses. Please remove all businesses from this category first.` 
      }, { status: 400 });
    }
    
    // Delete the category
    await prisma.categories.delete({
      where: { id }
    });

    return Response.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}