import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analyticsEvents } from '@/db/schema';
import { sql, count, countDistinct } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check for admin authentication via Bearer token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required',
          code: 'MISSING_AUTH_TOKEN' 
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const isValid = await verifyToken(token);
    
    if (!isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid or expired token',
          code: 'INVALID_AUTH_TOKEN' 
        },
        { status: 401 }
      );
    }

    // Calculate 24 hours ago timestamp
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Get total events count
    const totalEventsResult = await db
      .select({ count: count() })
      .from(analyticsEvents);
    const totalEvents = totalEventsResult[0]?.count ?? 0;

    // Get unique users count
    const uniqueUsersResult = await db
      .select({ count: countDistinct(analyticsEvents.userId) })
      .from(analyticsEvents);
    const uniqueUsers = uniqueUsersResult[0]?.count ?? 0;

    // Get events by type breakdown
    const eventsByTypeResult = await db
      .select({
        eventType: analyticsEvents.eventType,
        count: count()
      })
      .from(analyticsEvents)
      .groupBy(analyticsEvents.eventType);

    const eventsByType = eventsByTypeResult.map(row => ({
      eventType: row.eventType,
      count: row.count
    }));

    // Get events in last 24 hours
    const last24HoursResult = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.createdAt} >= ${twentyFourHoursAgo}`);
    const last24Hours = last24HoursResult[0]?.count ?? 0;

    // Get daily active users (unique users in last 24 hours)
    const dauResult = await db
      .select({ count: countDistinct(analyticsEvents.userId) })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.createdAt} >= ${twentyFourHoursAgo}`);
    const dau = dauResult[0]?.count ?? 0;

    return NextResponse.json({
      success: true,
      overview: {
        totalEvents,
        uniqueUsers,
        eventsByType,
        last24Hours,
        dau
      }
    });

  } catch (error) {
    console.error('GET analytics overview error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}