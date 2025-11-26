import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { codeExecutionLogs } from '@/db/schema';
import { verifyToken } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify Bearer token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Authorization header missing or invalid',
          code: 'MISSING_AUTH_HEADER' 
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const isValid = await verifyToken(token);
    
    if (!isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN' 
        },
        { status: 401 }
      );
    }

    // Calculate average statistics
    const avgStats = await db
      .select({
        avgCpu: sql<number>`AVG(${codeExecutionLogs.cpuUsage})`,
        avgMemory: sql<number>`AVG(${codeExecutionLogs.memoryUsage})`,
        avgExecutionTime: sql<number>`AVG(${codeExecutionLogs.executionTime})`,
        totalExecutions: sql<number>`COUNT(*)`,
      })
      .from(codeExecutionLogs);

    // Calculate executions by language
    const byLanguage = await db
      .select({
        language: codeExecutionLogs.language,
        count: sql<number>`COUNT(*)`,
      })
      .from(codeExecutionLogs)
      .groupBy(codeExecutionLogs.language);

    // Format response
    const stats = {
      avgCpu: avgStats[0]?.avgCpu || 0,
      avgMemory: avgStats[0]?.avgMemory || 0,
      avgExecutionTime: avgStats[0]?.avgExecutionTime || 0,
      totalExecutions: avgStats[0]?.totalExecutions || 0,
      byLanguage: byLanguage.map(item => ({
        language: item.language,
        count: item.count,
      })),
    };

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('GET code execution statistics error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}