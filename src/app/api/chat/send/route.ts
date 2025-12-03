import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys, modelConfig, chatMessages, chats } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { routeMessage } from '@/lib/intelligentRouter';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production-32bytes!!';
const ALGORITHM = 'aes-256-gcm';

function decryptValue(encryptedText: string): string {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8').slice(0, 32), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

async function getOpenRouterKey(): Promise<string | null> {
  try {
    const result = await db.select().from(apiKeys).where(eq(apiKeys.keyName, 'openrouter'));
    if (result.length === 0) return null;
    return decryptValue(result[0].encryptedValue);
  } catch (error) {
    console.error('[Chat] Error getting API key:', error);
    return null;
  }
}

async function getModelIdForCategory(category: string): Promise<string | null> {
  try {
    const result = await db.select().from(modelConfig).where(eq(modelConfig.category, category));
    if (result.length === 0) return null;
    return result[0].modelId;
  } catch (error) {
    console.error('[Chat] Error getting model ID:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json();
        const { message, chatId, userId } = body;

        if (!message || !chatId || !userId) {
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
            error: 'Missing required fields' 
          }) + '\n\n'));
          controller.close();
          return;
        }

        // Get OpenRouter API key
        const apiKey = await getOpenRouterKey();
        if (!apiKey) {
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
            error: 'OpenRouter API key not configured. Please contact admin.' 
          }) + '\n\n'));
          controller.close();
          return;
        }

        // Route message to appropriate model
        const routing = routeMessage(message);
        const modelId = await getModelIdForCategory(routing.category);
        
        if (!modelId) {
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
            error: `Model not configured for category: ${routing.category}` 
          }) + '\n\n'));
          controller.close();
          return;
        }

        console.log('🚀 [Chat] Sending to OpenRouter:', {
          model: modelId,
          category: routing.category,
          confidence: routing.confidence,
          reason: routing.reason,
        });

        // Save user message
        await db.insert(chatMessages).values({
          chatId,
          role: 'user',
          content: message,
          modelUsed: null,
          createdAt: new Date().toISOString(),
        });

        // Update chat timestamp
        await db
          .update(chats)
          .set({ updatedAt: new Date().toISOString() })
          .where(eq(chats.chatId, chatId));

        // Call OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'I AM DEVIL',
          },
          body: JSON.stringify({
            model: modelId,
            messages: [{ role: 'user', content: message }],
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Chat] OpenRouter error:', errorText);
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
            error: `OpenRouter API error: ${response.status}` 
          }) + '\n\n'));
          controller.close();
          return;
        }

        // Stream response
        const reader = response.body?.getReader();
        if (!reader) {
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
            error: 'No response stream' 
          }) + '\n\n'));
          controller.close();
          return;
        }

        let fullResponse = '';
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  fullResponse += content;
                  controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
                    content,
                    model: modelId,
                    category: routing.category,
                  }) + '\n\n'));
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        // Save assistant message
        await db.insert(chatMessages).values({
          chatId,
          role: 'assistant',
          content: fullResponse,
          modelUsed: modelId,
          createdAt: new Date().toISOString(),
        });

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        console.error('[Chat] Error:', error);
        controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
          error: 'Internal server error' 
        }) + '\n\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}