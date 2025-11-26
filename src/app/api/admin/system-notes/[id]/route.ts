import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { systemNotes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Validate ID
    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if note exists
    const existingNote = await db
      .select()
      .from(systemNotes)
      .where(eq(systemNotes.id, parseInt(id)))
      .limit(1);

    if (existingNote.length === 0) {
      return NextResponse.json(
        { error: 'System note not found', code: 'NOTE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, message, note_type, is_active, expires_at } = body;

    // Validate note_type if provided
    if (note_type !== undefined) {
      const validTypes = ['announcement', 'update', 'maintenance'];
      if (!validTypes.includes(note_type)) {
        return NextResponse.json(
          {
            error: 'Invalid note_type. Must be one of: announcement, update, maintenance',
            code: 'INVALID_NOTE_TYPE',
          },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (title !== undefined) updates.title = title;
    if (message !== undefined) updates.message = message;
    if (note_type !== undefined) updates.noteType = note_type;
    if (is_active !== undefined) updates.isActive = is_active;
    if (expires_at !== undefined) updates.expiresAt = expires_at;

    // Check if there are any fields to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_FIELDS_TO_UPDATE' },
        { status: 400 }
      );
    }

    // Update the note
    const updatedNote = await db
      .update(systemNotes)
      .set(updates)
      .where(eq(systemNotes.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      note: updatedNote[0],
    });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Validate ID
    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if note exists before deleting
    const existingNote = await db
      .select()
      .from(systemNotes)
      .where(eq(systemNotes.id, parseInt(id)))
      .limit(1);

    if (existingNote.length === 0) {
      return NextResponse.json(
        { error: 'System note not found', code: 'NOTE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the note
    await db.delete(systemNotes).where(eq(systemNotes.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: 'System note deleted',
    });
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}