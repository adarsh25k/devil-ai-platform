import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatLogs } from '@/db/schema';
import { detectAndRoute, routeForced } from '@/lib/modelRouter';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { message, userId, chatId, conversationHistory = [], selectedModel, debug = false } = body;

    // Validate inputs
    if (!message || !userId || !chatId) {
      return NextResponse.json(
        { error: 'Missing required fields: message, userId, chatId' },
        { status: 400 }
      );
    }

    // Route to appropriate model and get API key
    let routing;
    try {
      if (selectedModel && selectedModel !== 'auto') {
        // User manually selected a model
        routing = await routeForced(selectedModel);
      } else {
        // Auto-detect based on message content
        routing = await detectAndRoute(message);
      }
    } catch (error) {
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Routing error',
          code: 'ROUTING_ERROR' 
        },
        { status: 500 }
      );
    }

    // Debug mode: return routing info without calling API
    if (debug) {
      return NextResponse.json({
        debug: true,
        chosenModel: routing.model,
        chosenKey: routing.keyType,
        routerReason: routing.reason,
        category: routing.category,
        prompt: message,
        message: '[DEBUG MODE] - API call skipped'
      });
    }

    // Prepare messages for OpenRouter
    const messages = [
      {
        role: 'system',
        content: 'You are DEVIL DEV - an expert AI assistant specializing in software development, game development, and UI/UX design. Your expertise includes:\n\n- **Coding**: Debugging, backend development, frontend development, API design, database architecture, algorithms, and full-stack solutions across multiple languages (JavaScript, TypeScript, Python, Java, C++, etc.)\n- **Game Development**: Game mechanics, level design, game story writing, AI behavior, physics, multiplayer systems, Unity, Unreal Engine, and game engine architecture\n- **UI/UX Design**: Website mockups, user interface design, user experience optimization, responsive design, accessibility, and design systems\n- **Architecture & Planning**: System design, software architecture, tech stack selection, scalability planning, and project structure\n\nProvide expert, detailed, and practical responses. Include code examples when relevant. Be direct and focus on solving real development challenges.'
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
        'Authorization': `Bearer ${routing.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
        'X-Title': 'DEVIL DEV'
      },
      body: JSON.stringify({
        model: routing.model,
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
        modelUsed: routing.model,
        tokensIn,
        tokensOut: 0,
        routingReason: routing.reason,
        latency: 0,
        createdAt: new Date().toISOString()
      });

      await db.insert(chatLogs).values({
        userId,
        chatId,
        messageRole: 'assistant',
        messageContent: aiMessage,
        modelUsed: routing.model,
        tokensIn: 0,
        tokensOut,
        routingReason: routing.reason,
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
      model: routing.model,
      routingReason: routing.reason,
      category: routing.category,
      keyType: routing.keyType,
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