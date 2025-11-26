import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { systemNotes } from '@/db/schema';
import { verifyToken } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'MISSING_AUTH_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    
    if (!decoded || !decoded.username) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, message, note_type, is_active, expires_at } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    if (!note_type) {
      return NextResponse.json(
        { error: 'Note type is required', code: 'MISSING_NOTE_TYPE' },
        { status: 400 }
      );
    }

    // Validate note_type is one of allowed values
    const validNoteTypes = ['announcement', 'update', 'maintenance'];
    if (!validNoteTypes.includes(note_type)) {
      return NextResponse.json(
        {
          error: `Invalid note type. Must be one of: ${validNoteTypes.join(', ')}`,
          code: 'INVALID_NOTE_TYPE'
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedTitle = title.trim();
    const sanitizedMessage = message.trim();

    // Prepare insert data
    const insertData = {
      title: sanitizedTitle,
      message: sanitizedMessage,
      noteType: note_type,
      isActive: is_active !== undefined ? is_active : true,
      createdBy: decoded.username,
      createdAt: new Date().toISOString(),
      ...(expires_at && { expiresAt: expires_at })
    };

    // Insert into database
    const newNote = await db.insert(systemNotes)
      .values(insertData)
      .returning();

    return NextResponse.json(
      {
        success: true,
        note: newNote[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST system-notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}