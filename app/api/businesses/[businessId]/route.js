// app/api/businesses/[id]/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const businessId = parseInt(params.id);

    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: 'Invalid business ID' },
        { status: 400 }
      );
    }

    const business = await prisma.businesses.findUnique({
      where: { 
        id: businessId,
        is_active: true 
      },
      include: {
        business_images: {
          orderBy: [
            { is_primary: 'desc' },
            { display_order: 'asc' },
            { created_at: 'asc' }
          ]
        }
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(business);

  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const businessId = parseInt(params.id);
    const data = await request.json();

    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: 'Invalid business ID' },
        { status: 400 }
      );
    }

    // Remove fields that shouldn't be updated directly
    const { id, created_at, updated_at, business_images, ...updateData } = data;

    const updatedBusiness = await prisma.businesses.update({
      where: { id: businessId },
      data: {
        ...updateData,
        updated_at: new Date()
      },
      include: {
        business_images: {
          orderBy: [
            { is_primary: 'desc' },
            { display_order: 'asc' },
            { created_at: 'asc' }
          ]
        }
      }
    });

    return NextResponse.json(updatedBusiness);

  } catch (error) {
    console.error('Error updating business:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const businessId = parseInt(params.id);

    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: 'Invalid business ID' },
        { status: 400 }
      );
    }

    // Delete related images first
    await prisma.business_images.deleteMany({
      where: { business_id: businessId }
    });

    // Delete the business
    await prisma.businesses.delete({
      where: { id: businessId }
    });

    return NextResponse.json({ 
      message: 'Business deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting business:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}