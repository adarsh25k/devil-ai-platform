import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/utils/getApiKey';
import { verifyToken } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, status: 'ERROR', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    
    try {
      const tokenData = await verifyToken(token);
      
      if (!tokenData || !tokenData.username) {
        return NextResponse.json(
          { success: false, status: 'ERROR', message: 'Invalid or expired token' },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, status: 'ERROR', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { key_type } = body;
    
    if (!key_type || typeof key_type !== 'string') {
      return NextResponse.json(
        { success: false, status: 'ERROR', message: 'key_type is required' },
        { status: 400 }
      );
    }
    
    // Load key from database using universal helper
    const apiKey = await getApiKey(key_type);
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        status: 'NOT_FOUND',
        message: `API key not found in database: ${key_type}`,
        keyType: key_type
      });
    }
    
    // Test the key by calling OpenRouter /models endpoint
    try {
      const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        return NextResponse.json({
          success: true,
          status: 'WORKING',
          message: `API key ${key_type} is valid and working`,
          keyType: key_type,
          modelsCount: data.data?.length || 0
        });
      } else {
        const errorData = await testResponse.json().catch(() => ({ error: 'Unknown error' }));
        return NextResponse.json({
          success: false,
          status: 'INVALID',
          message: `API key ${key_type} is invalid: ${errorData.error?.message || testResponse.statusText}`,
          keyType: key_type
        });
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        status: 'ERROR',
        message: `Failed to test key ${key_type}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        keyType: key_type
      });
    }
  } catch (error) {
    console.error('Test key error:', error);
    return NextResponse.json(
      { 
        success: false,
        status: 'ERROR',
        message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}