import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/neon';

// GET: Fetch notifications
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== 'business_owner' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!user.business_id) {
      return NextResponse.json(
        { error: 'No business linked to account' },
        { status: 400 }
      );
    }

    const notifications = await sql`
      SELECT *
      FROM business_notifications
      WHERE business_id = ${user.business_id}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    // Generate sample notifications if none exist
    if (notifications.length === 0) {
      const sampleNotifications = [
        {
          type: 'new_lead',
          title: 'New Lead Received',
          message: 'You have a new lead for Dumpster Rental service',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          type: 'review',
          title: 'New Review Posted',
          message: 'A customer left a 5-star review for your service',
          read: false,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          type: 'subscription',
          title: 'Subscription Update',
          message: 'Your monthly lead credits have been renewed',
          read: true,
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      return NextResponse.json({
        notifications: sampleNotifications
      });
    }

    return NextResponse.json({
      notifications
    });

  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PATCH: Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== 'business_owner' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!user.business_id) {
      return NextResponse.json(
        { error: 'No business linked to account' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (notificationIds && notificationIds.length > 0) {
      await sql`
        UPDATE business_notifications
        SET read = true, read_at = NOW()
        WHERE id = ANY(${notificationIds})
        AND business_id = ${user.business_id}
      `;
    } else {
      // Mark all as read
      await sql`
        UPDATE business_notifications
        SET read = true, read_at = NOW()
        WHERE business_id = ${user.business_id}
        AND read = false
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read'
    });

  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
