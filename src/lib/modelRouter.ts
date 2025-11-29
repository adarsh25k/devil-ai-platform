import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto';

// Key type to model mapping
export const KEY_MODEL_MAP: Record<string, { keyType: string; model: string; description: string }> = {
  study: {
    keyType: 'openrouter_study_key',
    model: 'nousresearch/hermes-3-llama-3.1-405b:free',
    description: 'Nous Hermes 3 405B - Best for syllabus, notes, exam prep, question banks'
  },
  coding: {
    keyType: 'openrouter_coding_key',
    model: 'qwen/qwq-32b-preview',
    description: 'Qwen QwQ 32B - Best for debugging, APIs, backend, frontend code'
  },
  fast: {
    keyType: 'openrouter_fast_key',
    model: 'x-ai/grok-2-1212',
    description: 'Grok 2 - Fast responses for short queries'
  },
  image: {
    keyType: 'openrouter_image_key',
    model: 'black-forest-labs/flux-1.1-pro',
    description: 'Flux 1.1 Pro - Image generation'
  },
  video: {
    keyType: 'openrouter_video_key',
    model: 'openai/gpt-4-turbo',
    description: 'GPT-4 Turbo - Video content generation'
  },
  uiux: {
    keyType: 'openrouter_uiux_key',
    model: 'anthropic/claude-3.5-sonnet',
    description: 'Claude 3.5 Sonnet - UI/UX design and feedback'
  },
  ppt: {
    keyType: 'openrouter_ppt_key',
    model: 'openai/gpt-4o',
    description: 'GPT-4o - PowerPoint and slide content generation'
  },
  canvas: {
    keyType: 'openrouter_canvas_key',
    model: 'black-forest-labs/flux-1-schnell',
    description: 'Flux Schnell - Fast canvas/drawing generation'
  },
  game: {
    keyType: 'openrouter_game_key',
    model: 'deepseek/deepseek-r1',
    description: 'DeepSeek R1 - Game logic and mechanics'
  },
  auto: {
    keyType: 'openrouter_auto_key',
    model: 'nousresearch/hermes-3-llama-3.1-405b:free',
    description: 'Auto Router - Fallback for unmatched queries'
  }
};

// Detection patterns for auto-routing
const DETECTION_PATTERNS = {
  study: [
    'syllabus', 'exam', 'test', 'quiz', 'study', 'notes', 'lecture',
    'question bank', 'mcq', 'assignment', 'homework', 'learn',
    'explain', 'concept', 'theory', 'definition'
  ],
  coding: [
    'code', 'bug', 'debug', 'error', 'api', 'backend', 'frontend',
    'function', 'class', 'variable', 'syntax', 'compile', 'runtime',
    'javascript', 'python', 'java', 'c++', 'typescript', 'react',
    'node', 'algorithm', 'data structure', 'fix this', 'optimize'
  ],
  fast: [
    'quick', 'short', 'brief', 'summarize', 'tldr', 'what is',
    'who is', 'define', 'simple answer'
  ],
  image: [
    'generate image', 'create picture', 'draw', 'visualize',
    'illustration', 'graphic', 'photo', 'artwork', 'design image',
    'make image', 'picture of'
  ],
  video: [
    'video', 'animation', 'motion', 'movie', 'clip', 'footage',
    'video script', 'storyboard', 'video content'
  ],
  uiux: [
    'ui', 'ux', 'design', 'interface', 'user experience',
    'wireframe', 'mockup', 'prototype', 'layout', 'responsive',
    'mobile design', 'web design', 'dashboard', 'component design'
  ],
  ppt: [
    'powerpoint', 'presentation', 'slides', 'ppt', 'slide deck',
    'pitch deck', 'slideshow', 'present'
  ],
  canvas: [
    'canvas', 'drawing', 'sketch', 'paint', 'art', 'doodle',
    'whiteboard', 'diagram'
  ],
  game: [
    'game', 'gaming', 'gameplay', 'game mechanics', 'level design',
    'game dev', 'unity', 'unreal', 'gamemaker', 'phaser',
    'game logic', 'player', 'npc', 'inventory'
  ]
};

export interface RoutingResult {
  keyType: string;
  model: string;
  apiKey: string;
  reason: string;
  category: string;
}

/**
 * Auto-detect the appropriate model category based on message content
 */
export function detectCategory(message: string): string {
  const messageLower = message.toLowerCase();
  
  // Check each category's patterns
  for (const [category, patterns] of Object.entries(DETECTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (messageLower.includes(pattern)) {
        return category;
      }
    }
  }
  
  // Check message length for fast queries
  if (message.length < 100) {
    return 'fast';
  }
  
  // Default to auto (fallback)
  return 'auto';
}

/**
 * Get API key from database and decrypt it
 */
async function getApiKey(keyType: string): Promise<string | null> {
  try {
    const keyRecord = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyName, keyType))
      .limit(1);

    if (keyRecord.length === 0) {
      return null;
    }

    return decrypt(keyRecord[0].encryptedValue);
  } catch (error) {
    console.error(`Failed to retrieve key ${keyType}:`, error);
    return null;
  }
}

/**
 * Route to specific model based on category (force mode)
 */
export async function routeForced(category: string): Promise<RoutingResult> {
  const config = KEY_MODEL_MAP[category];
  
  if (!config) {
    // Fallback to auto if category is invalid
    const autoConfig = KEY_MODEL_MAP['auto'];
    const apiKey = await getApiKey(autoConfig.keyType);
    
    if (!apiKey) {
      throw new Error(`No API key configured for: ${autoConfig.keyType}`);
    }
    
    return {
      keyType: autoConfig.keyType,
      model: autoConfig.model,
      apiKey,
      reason: `Invalid category '${category}', using fallback`,
      category: 'auto'
    };
  }
  
  const apiKey = await getApiKey(config.keyType);
  
  if (!apiKey) {
    // Try to use auto key as fallback
    const autoConfig = KEY_MODEL_MAP['auto'];
    const fallbackKey = await getApiKey(autoConfig.keyType);
    
    if (!fallbackKey) {
      throw new Error(`No API key configured for: ${config.keyType} or fallback key`);
    }
    
    return {
      keyType: autoConfig.keyType,
      model: autoConfig.model,
      apiKey: fallbackKey,
      reason: `Key not found for ${config.keyType}, using auto fallback`,
      category: 'auto'
    };
  }
  
  return {
    keyType: config.keyType,
    model: config.model,
    apiKey,
    reason: `User selected: ${category}`,
    category
  };
}

/**
 * Auto-detect and route based on message content
 */
export async function detectAndRoute(message: string): Promise<RoutingResult> {
  const category = detectCategory(message);
  const config = KEY_MODEL_MAP[category];
  
  const apiKey = await getApiKey(config.keyType);
  
  if (!apiKey) {
    // Try to use auto key as fallback
    const autoConfig = KEY_MODEL_MAP['auto'];
    const fallbackKey = await getApiKey(autoConfig.keyType);
    
    if (!fallbackKey) {
      throw new Error(`No API key configured for detected category: ${config.keyType} or fallback key`);
    }
    
    return {
      keyType: autoConfig.keyType,
      model: autoConfig.model,
      apiKey: fallbackKey,
      reason: `Auto-detected: ${category}, but key not found. Using fallback.`,
      category: 'auto'
    };
  }
  
  return {
    keyType: config.keyType,
    model: config.model,
    apiKey,
    reason: `Auto-detected: ${category}`,
    category
  };
}

/**
 * Get all available model categories with their status
 */
export async function getAvailableModels(): Promise<Array<{ category: string; model: string; description: string; hasKey: boolean }>> {
  const results = [];
  
  for (const [category, config] of Object.entries(KEY_MODEL_MAP)) {
    const apiKey = await getApiKey(config.keyType);
    results.push({
      category,
      model: config.model,
      description: config.description,
      hasKey: !!apiKey
    });
  }
  
  return results;
}
