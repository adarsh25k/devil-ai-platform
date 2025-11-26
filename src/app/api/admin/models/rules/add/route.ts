import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { modelRoutingRules } from '@/db/schema';
import { verifyToken } from '@/lib/db';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { rule_name, trigger_type, trigger_value, target_model, priority } = body;

    // Validate required fields
    if (!rule_name || typeof rule_name !== 'string' || rule_name.trim() === '') {
      return NextResponse.json(
        { error: 'rule_name is required and must be a non-empty string', code: 'MISSING_RULE_NAME' },
        { status: 400 }
      );
    }

    if (!trigger_type || typeof trigger_type !== 'string') {
      return NextResponse.json(
        { error: 'trigger_type is required', code: 'MISSING_TRIGGER_TYPE' },
        { status: 400 }
      );
    }

    // Validate trigger_type is one of allowed values
    const allowedTriggerTypes = ['keyword', 'file_type', 'length', 'intent'];
    if (!allowedTriggerTypes.includes(trigger_type)) {
      return NextResponse.json(
        { 
          error: `trigger_type must be one of: ${allowedTriggerTypes.join(', ')}`, 
          code: 'INVALID_TRIGGER_TYPE' 
        },
        { status: 400 }
      );
    }

    if (!trigger_value || typeof trigger_value !== 'string' || trigger_value.trim() === '') {
      return NextResponse.json(
        { error: 'trigger_value is required and must be a non-empty string', code: 'MISSING_TRIGGER_VALUE' },
        { status: 400 }
      );
    }

    if (!target_model || typeof target_model !== 'string' || target_model.trim() === '') {
      return NextResponse.json(
        { error: 'target_model is required and must be a non-empty string', code: 'MISSING_TARGET_MODEL' },
        { status: 400 }
      );
    }

    // Validate priority if provided, default to 0
    const finalPriority = priority !== undefined ? parseInt(String(priority)) : 0;
    if (isNaN(finalPriority)) {
      return NextResponse.json(
        { error: 'priority must be a valid number', code: 'INVALID_PRIORITY' },
        { status: 400 }
      );
    }

    // Insert the new routing rule
    const newRule = await db.insert(modelRoutingRules)
      .values({
        ruleName: rule_name.trim(),
        triggerType: trigger_type.trim(),
        triggerValue: trigger_value.trim(),
        targetModel: target_model.trim(),
        priority: finalPriority,
        isEnabled: true,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(
      { 
        success: true, 
        rule: newRule[0] 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/model-routing-rules error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}