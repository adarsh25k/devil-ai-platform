import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ragFiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if file exists and belongs to user
    const existingFile = await db
      .select()
      .from(ragFiles)
      .where(and(eq(ragFiles.id, parseInt(id)), eq(ragFiles.userId, user.id)))
      .limit(1);

    if (existingFile.length === 0) {
      return NextResponse.json(
        { error: 'RAG file not found', code: 'FILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the file
    const deleted = await db
      .delete(ragFiles)
      .where(and(eq(ragFiles.id, parseInt(id)), eq(ragFiles.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete RAG file', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'RAG file deleted',
        deletedFile: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}