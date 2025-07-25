// app/api/admin/subscribers/export/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause
    let whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Get all subscribers matching criteria
    const subscribers = await prisma.email_subscribers.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      select: {
        email: true,
        source: true,
        status: true,
        subscribed_at: true,
        created_at: true,
        updated_at: true
      }
    });

    // Convert to CSV
    const headers = ['Email', 'Source', 'Status', 'Subscribed Date', 'Created Date', 'Updated Date'];
    const csvContent = [
      headers.join(','),
      ...subscribers.map(sub => [
        sub.email,
        sub.source,
        sub.status,
        sub.subscribed_at ? new Date(sub.subscribed_at).toISOString() : '',
        new Date(sub.created_at).toISOString(),
        new Date(sub.updated_at).toISOString()
      ].join(','))
    ].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting subscribers:', error);
    return Response.json({ error: 'Failed to export subscribers' }, { status: 500 });
  }
}