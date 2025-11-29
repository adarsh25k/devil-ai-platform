import { getApiKey } from '@/utils/getApiKey';

// DEVIL DEV - 5 Key Architecture
export const KEY_MODEL_MAP: Record<string, { keyType: string; model: string; description: string }> = {
  main_brain: {
    keyType: 'main_brain_key',
    model: 'nousresearch/hermes-3-llama-3.1-405b:free',
    description: 'Main Brain - General dev AI, planning, architecture'
  },
  coding: {
    keyType: 'coding_key',
    model: 'qwen/qwq-32b-preview',
    description: 'Coding Expert - Debugging, backend, frontend, APIs'
  },
  uiux: {
    keyType: 'uiux_key',
    model: 'deepseek/deepseek-r1',
    description: 'UI/UX Designer - Website mockups, design feedback'
  },
  game_dev: {
    keyType: 'game_dev_key',
    model: 'deepseek/deepseek-r1',
    description: 'Game Developer - Game logic, level design, story'
  },
  image: {
    keyType: 'image_key',
    model: 'black-forest-labs/flux-1.1-pro',
    description: 'Image Generator - UI mockups, game assets, logos'
  }
};

// Smart detection patterns for developer tasks
const DETECTION_PATTERNS = {
  coding: [
    'bug', 'fix', 'error', 'debug', 'stacktrace', 'exception',
    'api', 'backend', 'database', 'auth', 'jwt', 'server',
    'code', 'function', 'class', 'variable', 'syntax', 'compile',
    'javascript', 'python', 'java', 'typescript', 'react', 'node',
    'sql', 'query', 'endpoint', 'route', 'middleware'
  ],
  uiux: [
    'ui', 'ux', 'design', 'mockup', 'wireframe', 'homepage', 'layout',
    'interface', 'user experience', 'prototype', 'responsive',
    'mobile design', 'web design', 'dashboard', 'component',
    'landing page', 'website', 'page design', 'navigation'
  ],
  game_dev: [
    'game', 'story', 'enemy', 'level', 'ai behaviour', 'quest',
    'gameplay', 'game mechanics', 'game dev', 'unity', 'unreal',
    'player', 'npc', 'inventory', 'character', 'boss fight',
    'game logic', 'level design', 'game story', 'game narrative'
  ],
  image: [
    'asset', 'character image', 'logo', 'splash art', 'icon',
    'generate image', 'create picture', 'draw', 'illustration',
    'graphic', 'artwork', 'banner', 'thumbnail', 'sprite'
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
 * Smart auto-detection for developer tasks
 */
export function detectCategory(message: string): string {
  const messageLower = message.toLowerCase();
  
  // Check each category's patterns (order matters: specific to general)
  for (const [category, patterns] of Object.entries(DETECTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (messageLower.includes(pattern)) {
        return category;
      }
    }
  }
  
  // Default to main brain for planning, architecture, general queries
  return 'main_brain';
}

/**
 * Route to specific model (no user selection - auto only)
 */
export async function routeForced(category: string): Promise<RoutingResult> {
  const config = KEY_MODEL_MAP[category];
  
  if (!config) {
    // Fallback to main brain if category is invalid
    const mainBrainConfig = KEY_MODEL_MAP['main_brain'];
    const apiKey = await getApiKey(mainBrainConfig.keyType);
    
    if (!apiKey) {
      throw new Error(`API key missing for model: ${mainBrainConfig.keyType}`);
    }
    
    return {
      keyType: mainBrainConfig.keyType,
      model: mainBrainConfig.model,
      apiKey,
      reason: `Invalid category '${category}', using Main Brain fallback`,
      category: 'main_brain'
    };
  }
  
  const apiKey = await getApiKey(config.keyType);
  
  if (!apiKey) {
    // Try to use main brain as fallback
    const mainBrainConfig = KEY_MODEL_MAP['main_brain'];
    const fallbackKey = await getApiKey(mainBrainConfig.keyType);
    
    if (!fallbackKey) {
      throw new Error(`API key missing for model: ${config.keyType}`);
    }
    
    return {
      keyType: mainBrainConfig.keyType,
      model: mainBrainConfig.model,
      apiKey: fallbackKey,
      reason: `Key not found for ${config.keyType}, using Main Brain fallback`,
      category: 'main_brain'
    };
  }
  
  return {
    keyType: config.keyType,
    model: config.model,
    apiKey,
    reason: `Forced routing to: ${category}`,
    category
  };
}

/**
 * Auto-detect and route based on message content (primary method)
 */
export async function detectAndRoute(message: string): Promise<RoutingResult> {
  const category = detectCategory(message);
  const config = KEY_MODEL_MAP[category];
  
  const apiKey = await getApiKey(config.keyType);
  
  if (!apiKey) {
    // Try to use main brain as fallback
    const mainBrainConfig = KEY_MODEL_MAP['main_brain'];
    const fallbackKey = await getApiKey(mainBrainConfig.keyType);
    
    if (!fallbackKey) {
      throw new Error(`API key missing for model: ${config.keyType}`);
    }
    
    return {
      keyType: mainBrainConfig.keyType,
      model: mainBrainConfig.model,
      apiKey: fallbackKey,
      reason: `Auto-detected: ${category}, but key not found. Using Main Brain fallback.`,
      category: 'main_brain'
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