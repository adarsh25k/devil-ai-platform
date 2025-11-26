import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { modelRoutingRules } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

const VALID_TRIGGER_TYPES = ['keyword', 'file_type', 'length', 'intent'];

async function authenticateAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    const isValid = await verifyToken(token);
    return isValid;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await authenticateAdmin(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing authentication token', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingRule = await db
      .select()
      .from(modelRoutingRules)
      .where(eq(modelRoutingRules.id, parseInt(id)))
      .limit(1);

    if (existingRule.length === 0) {
      return NextResponse.json(
        { error: 'Rule not found', code: 'RULE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (body.triggerType && !VALID_TRIGGER_TYPES.includes(body.triggerType)) {
      return NextResponse.json(
        {
          error: `Invalid trigger_type. Must be one of: ${VALID_TRIGGER_TYPES.join(', ')}`,
          code: 'INVALID_TRIGGER_TYPE'
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};

    if (body.ruleName !== undefined) updateData.ruleName = body.ruleName;
    if (body.triggerType !== undefined) updateData.triggerType = body.triggerType;
    if (body.triggerValue !== undefined) updateData.triggerValue = body.triggerValue;
    if (body.targetModel !== undefined) updateData.targetModel = body.targetModel;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.isEnabled !== undefined) updateData.isEnabled = body.isEnabled;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    const updatedRule = await db
      .update(modelRoutingRules)
      .set(updateData)
      .where(eq(modelRoutingRules.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      rule: updatedRule[0]
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await authenticateAdmin(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing authentication token', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingRule = await db
      .select()
      .from(modelRoutingRules)
      .where(eq(modelRoutingRules.id, parseInt(id)))
      .limit(1);

    if (existingRule.length === 0) {
      return NextResponse.json(
        { error: 'Rule not found', code: 'RULE_NOT_FOUND' },
        { status: 404 }
      );
    }

    await db
      .delete(modelRoutingRules)
      .where(eq(modelRoutingRules.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Rule deleted'
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}