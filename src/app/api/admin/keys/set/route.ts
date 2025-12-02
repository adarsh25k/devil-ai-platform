import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/db';
import { saveApiKey } from '@/lib/apiKeyPersistence';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    
    try {
      const tokenData = await verifyToken(token);
      
      if (!tokenData || !tokenData.username) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { key_name, value, model_id } = body;
    
    // Validate required fields
    if (!key_name || typeof key_name !== 'string') {
      return NextResponse.json(
        { error: 'key_name is required' },
        { status: 400 }
      );
    }
    
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return NextResponse.json(
        { error: 'API key value is required' },
        { status: 400 }
      );
    }
    
    if (!model_id || typeof model_id !== 'string' || model_id.trim().length === 0) {
      return NextResponse.json(
        { error: 'model_id is required - must specify exact OpenRouter model ID' },
        { status: 400 }
      );
    }
    
    console.log(`[Admin] Saving API key: ${key_name} with model ID: "${model_id}"`);
    
    // Save to database using new persistence layer
    const result = await saveApiKey(key_name.trim(), value.trim(), model_id.trim(), 'admin');
    
    console.log(`[Admin] API key saved successfully: ${key_name} → Model: ${model_id}`);
    
    return NextResponse.json({
      success: true,
      message: result.message,
      keyName: result.keyName,
      modelId: model_id.trim()
    });
    
  } catch (error) {
    console.error('Set API key error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}