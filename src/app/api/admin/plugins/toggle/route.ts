import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { plugins } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Admin authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header with Bearer token required', code: 'MISSING_AUTH' },
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

    // Parse request body
    const body = await request.json();
    const { plugin_name, is_enabled } = body;

    // Validate required fields
    if (!plugin_name || typeof plugin_name !== 'string') {
      return NextResponse.json(
        { error: 'plugin_name is required and must be a string', code: 'MISSING_PLUGIN_NAME' },
        { status: 400 }
      );
    }

    if (typeof is_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'is_enabled is required and must be a boolean', code: 'MISSING_IS_ENABLED' },
        { status: 400 }
      );
    }

    // Check if plugin exists
    const existingPlugin = await db
      .select()
      .from(plugins)
      .where(eq(plugins.pluginName, plugin_name))
      .limit(1);

    if (existingPlugin.length === 0) {
      return NextResponse.json(
        { error: 'Plugin not found', code: 'PLUGIN_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update plugin
    const updated = await db
      .update(plugins)
      .set({
        isEnabled: is_enabled,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(plugins.pluginName, plugin_name))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update plugin', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plugin: updated[0],
    });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}