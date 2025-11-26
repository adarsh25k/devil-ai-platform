import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys, modelRoutingRules, chatLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto';

// Model router function
async function selectModel(message: string): Promise<{ model: string; reason: string }> {
  try {
    // Fetch all enabled routing rules sorted by priority
    const rules = await db
      .select()
      .from(modelRoutingRules)
      .where(eq(modelRoutingRules.isEnabled, true))
      .orderBy(modelRoutingRules.priority);

    const messageLower = message.toLowerCase();

    // Check each rule
    for (const rule of rules) {
      const triggerValue = rule.triggerValue.toLowerCase();
      
      if (rule.triggerType === 'keyword') {
        const keywords = triggerValue.split(',').map(k => k.trim());
        if (keywords.some(keyword => messageLower.includes(keyword))) {
          return {
            model: rule.targetModel,
            reason: `Matched keyword rule: ${rule.ruleName}`
          };
        }
      } else if (rule.triggerType === 'length') {
        const threshold = parseInt(triggerValue);
        if (message.length > threshold) {
          return {
            model: rule.targetModel,
            reason: `Matched length rule: ${rule.ruleName}`
          };
        }
      } else if (rule.triggerType === 'intent') {
        const intents = triggerValue.split(',').map(i => i.trim());
        if (intents.some(intent => messageLower.includes(intent))) {
          return {
            model: rule.targetModel,
            reason: `Matched intent rule: ${rule.ruleName}`
          };
        }
      }
    }

    // Default model if no rules match
    return {
      model: 'qwen/qwen-2.5-72b-instruct',
      reason: 'Default model (no rules matched)'
    };
  } catch (error) {
    console.error('Model router error:', error);
    return {
      model: 'qwen/qwen-2.5-72b-instruct',
      reason: 'Default model (router error)'
    };
  }
}

// Retrieve and decrypt API key
async function getOpenRouterKey(): Promise<string | null> {
  try {
    const keyRecord = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyName, 'openrouter_api_key'))
      .limit(1);

    if (keyRecord.length === 0) {
      return null;
    }

    return decrypt(keyRecord[0].encryptedValue);
  } catch (error) {
    console.error('Failed to retrieve API key:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { message, userId, chatId, conversationHistory = [] } = body;

    // Validate inputs
    if (!message || !userId || !chatId) {
      return NextResponse.json(
        { error: 'Missing required fields: message, userId, chatId' },
        { status: 400 }
      );
    }

    // Get OpenRouter API key
    const apiKey = await getOpenRouterKey();
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'OpenRouter API key not configured. Please add it in Admin > API Keys.',
          code: 'NO_API_KEY' 
        },
        { status: 500 }
      );
    }

    // Select model based on routing rules
    const { model, reason } = await selectModel(message);

    // Prepare messages for OpenRouter
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful and knowledgeable AI assistant. Provide accurate, detailed, and helpful responses.'
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
        'X-Title': 'I AM DEVIL'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { 
          error: `OpenRouter API error: ${errorData.error?.message || response.statusText}`,
          code: 'OPENROUTER_ERROR'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'No response generated';
    const tokensIn = data.usage?.prompt_tokens || 0;
    const tokensOut = data.usage?.completion_tokens || 0;
    const latency = Date.now() - startTime;

    // Log the chat interaction
    try {
      await db.insert(chatLogs).values({
        userId,
        chatId,
        messageRole: 'user',
        messageContent: message,
        modelUsed: model,
        tokensIn,
        tokensOut: 0,
        routingReason: reason,
        latency: 0,
        createdAt: new Date().toISOString()
      });

      await db.insert(chatLogs).values({
        userId,
        chatId,
        messageRole: 'assistant',
        messageContent: aiMessage,
        modelUsed: model,
        tokensIn: 0,
        tokensOut,
        routingReason: reason,
        latency,
        createdAt: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log chat:', logError);
      // Don't fail the request if logging fails
    }

    // Return the response
    return NextResponse.json({
      message: aiMessage,
      model,
      routingReason: reason,
      citations: [],
      raw: data,
      usage: {
        tokensIn,
        tokensOut,
        totalTokens: tokensIn + tokensOut
      },
      latency
    });

  } catch (error) {
    console.error('Chat send error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
