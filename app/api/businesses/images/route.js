// app/api/businesses/images/route.js
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const businessId = formData.get('businessId');
    const images = formData.getAll('images');

    if (!businessId || images.length === 0) {
      return NextResponse.json(
        { error: 'Business ID and images are required' },
        { status: 400 }
      );
    }

    // Verify business exists
    const business = await prisma.businesses.findUnique({
      where: { id: parseInt(businessId) }
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'businesses');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const uploadedImages = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const isPrimary = formData.get(`isPrimary_${i}`) === 'true';

      if (image instanceof File) {
        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        const extension = path.extname(image.name);
        const filename = `${businessId}_${timestamp}_${random}${extension}`;
        
        // Save file to uploads directory
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filepath = path.join(uploadDir, filename);
        
        await writeFile(filepath, buffer);

        // Save image record to database
        const savedImage = await prisma.business_images.create({
          data: {
            business_id: parseInt(businessId),
            image_url: `/uploads/businesses/${filename}`,
            alt_text: `${business.name} - Image ${i + 1}`,
            is_primary: isPrimary,
            display_order: i + 1
          }
        });

        uploadedImages.push(savedImage);
      }
    }

    // If this is the first image being uploaded, make it primary
    if (uploadedImages.length > 0) {
      const existingImages = await prisma.business_images.findMany({
        where: { business_id: parseInt(businessId) }
      });

      const hasPrimary = existingImages.some(img => img.is_primary);
      
      if (!hasPrimary && uploadedImages.length > 0) {
        await prisma.business_images.update({
          where: { id: uploadedImages[0].id },
          data: { is_primary: true }
        });
      }
    }

    return NextResponse.json({
      message: 'Images uploaded successfully',
      images: uploadedImages
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

// DELETE endpoint for removing images
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const businessId = searchParams.get('businessId');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Find the image
    const image = await prisma.business_images.findUnique({
      where: { id: parseInt(imageId) }
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete the image record from database
    await prisma.business_images.delete({
      where: { id: parseInt(imageId) }
    });

    // Optionally delete the physical file
    try {
      const fs = require('fs').promises;
      const filePath = path.join(process.cwd(), 'public', image.image_url);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.log('Could not delete physical file:', fileError);
      // Continue even if file deletion fails
    }

    // If deleted image was primary, make another image primary
    if (image.is_primary && businessId) {
      const remainingImages = await prisma.business_images.findMany({
        where: { business_id: parseInt(businessId) },
        orderBy: { display_order: 'asc' }
      });

      if (remainingImages.length > 0) {
        await prisma.business_images.update({
          where: { id: remainingImages[0].id },
          data: { is_primary: true }
        });
      }
    }

    return NextResponse.json({
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating image properties (like setting primary)
export async function PUT(request) {
  try {
    const { imageId, businessId, is_primary, alt_text, display_order } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // If setting as primary, remove primary status from other images
    if (is_primary && businessId) {
      await prisma.business_images.updateMany({
        where: { 
          business_id: parseInt(businessId),
          id: { not: parseInt(imageId) }
        },
        data: { is_primary: false }
      });
    }

    // Update the image
    const updatedImage = await prisma.business_images.update({
      where: { id: parseInt(imageId) },
      data: {
        ...(is_primary !== undefined && { is_primary }),
        ...(alt_text !== undefined && { alt_text }),
        ...(display_order !== undefined && { display_order })
      }
    });

    return NextResponse.json({
      message: 'Image updated successfully',
      image: updatedImage
    });

  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}