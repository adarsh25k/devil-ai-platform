import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analyticsEvents } from '@/db/schema';

const VALID_EVENT_TYPES = ['chat', 'file_upload', 'code_run', 'login'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, user_id, metadata } = body;

    // Validate required fields
    if (!event_type) {
      return NextResponse.json(
        { 
          error: 'event_type is required',
          code: 'MISSING_EVENT_TYPE'
        },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { 
          error: 'user_id is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate event_type is one of the allowed values
    if (!VALID_EVENT_TYPES.includes(event_type)) {
      return NextResponse.json(
        { 
          error: `event_type must be one of: ${VALID_EVENT_TYPES.join(', ')}`,
          code: 'INVALID_EVENT_TYPE'
        },
        { status: 400 }
      );
    }

    // Validate event_type and user_id are strings
    if (typeof event_type !== 'string') {
      return NextResponse.json(
        { 
          error: 'event_type must be a string',
          code: 'INVALID_EVENT_TYPE_FORMAT'
        },
        { status: 400 }
      );
    }

    if (typeof user_id !== 'string') {
      return NextResponse.json(
        { 
          error: 'user_id must be a string',
          code: 'INVALID_USER_ID_FORMAT'
        },
        { status: 400 }
      );
    }

    // Validate metadata is an object if provided
    if (metadata !== undefined && metadata !== null && typeof metadata !== 'object') {
      return NextResponse.json(
        { 
          error: 'metadata must be an object',
          code: 'INVALID_METADATA_FORMAT'
        },
        { status: 400 }
      );
    }

    // Insert analytics event
    const newEvent = await db.insert(analyticsEvents)
      .values({
        eventType: event_type,
        userId: user_id,
        metadata: metadata || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        event: newEvent[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST analytics error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}