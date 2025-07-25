// app/api/admin/subscribers/[id]/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Update subscriber status
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { status } = await request.json();

    if (!['active', 'unsubscribed'].includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedSubscriber = await prisma.email_subscribers.update({
      where: { id: id },
      data: {
        status: status,
        updated_at: new Date()
      }
    });

    return Response.json({
      message: 'Subscriber updated successfully',
      subscriber: {
        id: updatedSubscriber.id.toString(),
        email: updatedSubscriber.email,
        status: updatedSubscriber.status
      }
    });

  } catch (error) {
    console.error('Error updating subscriber:', error);
    return Response.json({ error: 'Failed to update subscriber' }, { status: 500 });
  }
}

// Delete subscriber
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.email_subscribers.delete({
      where: { id: id }
    });

    return Response.json({ message: 'Subscriber deleted successfully' });

  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return Response.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}