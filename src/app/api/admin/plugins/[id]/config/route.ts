import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { plugins } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin authentication check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header with Bearer token required', code: 'UNAUTHORIZED' },
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

    // Extract and validate ID from params
    const { id } = params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid plugin ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const pluginId = parseInt(id);

    // Parse and validate request body
    const body = await request.json();
    const { config } = body;

    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { error: 'Config object is required', code: 'MISSING_CONFIG' },
        { status: 400 }
      );
    }

    // Check if plugin exists
    const existingPlugin = await db
      .select()
      .from(plugins)
      .where(eq(plugins.id, pluginId))
      .limit(1);

    if (existingPlugin.length === 0) {
      return NextResponse.json(
        { error: 'Plugin not found', code: 'PLUGIN_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update plugin configuration
    const updatedPlugin = await db
      .update(plugins)
      .set({
        config: config,
        updatedAt: new Date().toISOString()
      })
      .where(eq(plugins.id, pluginId))
      .returning();

    if (updatedPlugin.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update plugin', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        plugin: updatedPlugin[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT plugin config error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}