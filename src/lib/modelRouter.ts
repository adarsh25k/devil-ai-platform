import { getKeyAndModel } from '@/lib/apiKeyPersistence';

// 🔥 DEVIL DEV - 8 Key Architecture
// ⚠️ CRITICAL: Model IDs are now pulled from DATABASE - this map is for category detection ONLY
export const KEY_TYPE_MAP: Record<string, { keyType: string; description: string }> = {
  main_brain: {
    keyType: 'main_brain_key',
    description: 'Main Brain - General dev AI, planning, architecture'
  },
  coding: {
    keyType: 'coding_key',
    description: 'Coding Expert - Debugging, backend, frontend, APIs'
  },
  debugging: {
    keyType: 'debugging_api_key',
    description: 'Debugging / Fix Bugs - Error resolution, stacktrace analysis'
  },
  fast: {
    keyType: 'fast_api_key',
    description: 'Fast Daily Use - Quick answers, short messages'
  },
  uiux_mockup: {
    keyType: 'uiux_mockup_api_key',
    description: 'UI/UX & Mockup - Screen design, wireframes, Figma layouts'
  },
  image_generation: {
    keyType: 'image_generation_api_key',
    description: 'Image Generation - AI-generated graphics, logos, icons, concept art'
  },
  game_dev: {
    keyType: 'game_dev_key',
    description: 'Game Developer - Game logic, level design, story'
  },
  canvas_notes: {
    keyType: 'canvas_notes_api_key',
    description: 'Canvas / PPT / Notes - Presentations, cheat sheets, study notes'
  }
};

// Smart detection patterns for developer tasks
const DETECTION_PATTERNS = {
  debugging: [
    'error', 'fix bug', 'debug', 'exception', 'stacktrace', 'crash',
    'not working', 'broken', 'issue', 'problem', 'fails', 'failure',
    'traceback', 'runtime error', 'syntax error', 'null pointer',
    'undefined', 'cannot read property', 'reference error'
  ],
  fast: [
    'quick', 'fast', 'small answer', 'briefly', 'short',
    'simple question', 'what is', 'how to', 'explain',
    'define', 'meaning', 'difference between'
  ],
  canvas_notes: [
    'ppt', 'presentation', 'canvas', 'notes', 'cheat sheet',
    'summary', 'study guide', 'slides', 'powerpoint',
    'keynote', 'lecture notes', 'outline', 'bullet points',
    'markdown notes', 'documentation'
  ],
  uiux_mockup: [
    'make ui', 'create screen', 'screen design', 'mobile app layout',
    'website mockup', 'figma style', 'figma layout', 'wireframe',
    'ui design', 'ux design', 'interface design', 'mockup',
    'landing page', 'dashboard', 'homepage', 'web layout',
    'mobile design', 'app screen', 'responsive design'
  ],
  image_generation: [
    'generate image', 'create image', 'make image',
    'give logo', 'create logo', 'logo design',
    'make app screen image', 'screen image', 'ui screenshot',
    'icon design', 'make icon', 'create icon',
    'character art', 'character design', 'concept art',
    'cover art', 'banner design', 'poster design',
    'illustration', 'graphic design', 'visual art'
  ],
  coding: [
    'api', 'backend', 'database', 'auth', 'jwt', 'server',
    'code', 'function', 'class', 'variable', 'syntax', 'compile',
    'javascript', 'python', 'java', 'typescript', 'react', 'node',
    'sql', 'query', 'endpoint', 'route', 'middleware'
  ],
  game_dev: [
    'game', 'story', 'enemy', 'level', 'ai behaviour', 'quest',
    'gameplay', 'game mechanics', 'game dev', 'unity', 'unreal',
    'player', 'npc', 'inventory', 'character', 'boss fight',
    'game logic', 'level design', 'game story', 'game narrative'
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
 * Smart auto-detection for developer tasks (PRIORITY ORDER)
 */
export function detectCategory(message: string): string {
  const messageLower = message.toLowerCase();
  const messageLength = message.trim().length;
  
  // Priority 1: Debugging patterns (errors, bugs, exceptions)
  for (const pattern of DETECTION_PATTERNS.debugging) {
    if (messageLower.includes(pattern)) {
      console.log(`🐛 Routing to DEBUGGING: detected pattern "${pattern}"`);
      return 'debugging';
    }
  }
  
  // Priority 2: Canvas/Notes patterns
  for (const pattern of DETECTION_PATTERNS.canvas_notes) {
    if (messageLower.includes(pattern)) {
      console.log(`📝 Routing to CANVAS/NOTES: detected pattern "${pattern}"`);
      return 'canvas_notes';
    }
  }
  
  // Priority 3: UI/UX Mockup
  for (const pattern of DETECTION_PATTERNS.uiux_mockup) {
    if (messageLower.includes(pattern)) {
      console.log(`🎨 Routing to UI/UX MOCKUP: detected pattern "${pattern}"`);
      return 'uiux_mockup';
    }
  }
  
  // Priority 4: Image Generation
  for (const pattern of DETECTION_PATTERNS.image_generation) {
    if (messageLower.includes(pattern)) {
      console.log(`🖼️ Routing to IMAGE GENERATION: detected pattern "${pattern}"`);
      return 'image_generation';
    }
  }
  
  // Priority 5: Fast queries (short messages)
  if (messageLength < 50) {
    for (const pattern of DETECTION_PATTERNS.fast) {
      if (messageLower.includes(pattern)) {
        console.log(`⚡ Routing to FAST: short message with pattern "${pattern}"`);
        return 'fast';
      }
    }
    if (messageLength < 30) {
      console.log(`⚡ Routing to FAST: very short message (${messageLength} chars)`);
      return 'fast';
    }
  }
  
  // Priority 6-8: Check other categories
  for (const [category, patterns] of Object.entries(DETECTION_PATTERNS)) {
    if (category === 'debugging' || category === 'fast' || category === 'canvas_notes' || 
        category === 'uiux_mockup' || category === 'image_generation') {
      continue;
    }
    
    for (const pattern of patterns) {
      if (messageLower.includes(pattern)) {
        console.log(`✓ Routing to ${category.toUpperCase()}: detected pattern "${pattern}"`);
        return category;
      }
    }
  }
  
  // Default to main brain
  console.log(`🧠 Routing to MAIN BRAIN: no specific patterns detected`);
  return 'main_brain';
}

/**
 * 🔥 NEW: Pull API key AND model ID from database - single source of truth
 * Returns EXACT model ID from database - NO MODIFICATIONS
 */
export async function routeForced(category: string): Promise<RoutingResult> {
  console.log(`\n🔥 [ROUTING] Forced routing to category: ${category}`);
  
  const config = KEY_TYPE_MAP[category];
  
  if (!config) {
    console.warn(`⚠️ [ROUTING] Invalid category '${category}', using Main Brain fallback`);
    const mainBrainConfig = KEY_TYPE_MAP['main_brain'];
    const keyData = await getKeyAndModel(mainBrainConfig.keyType);
    
    if (!keyData) {
      throw new Error(`API key and model missing for: ${mainBrainConfig.keyType}`);
    }
    
    const result = {
      keyType: mainBrainConfig.keyType,
      model: keyData.modelId,
      apiKey: keyData.apiKey,
      reason: `Invalid category '${category}', using Main Brain fallback`,
      category: 'main_brain'
    };
    
    console.log(`✅ [ROUTING] Fallback model from DB: "${result.model}"`);
    return result;
  }
  
  console.log(`🔍 [ROUTING] Fetching key and model from DB for: ${config.keyType}`);
  const keyData = await getKeyAndModel(config.keyType);
  
  if (!keyData) {
    console.warn(`⚠️ [ROUTING] Key/Model not found for ${config.keyType}, using Main Brain fallback`);
    const mainBrainConfig = KEY_TYPE_MAP['main_brain'];
    const fallbackData = await getKeyAndModel(mainBrainConfig.keyType);
    
    if (!fallbackData) {
      throw new Error(`API key and model missing for: ${config.keyType}`);
    }
    
    const result = {
      keyType: mainBrainConfig.keyType,
      model: fallbackData.modelId,
      apiKey: fallbackData.apiKey,
      reason: `Key not found for ${config.keyType}, using Main Brain fallback`,
      category: 'main_brain'
    };
    
    console.log(`✅ [ROUTING] Fallback model from DB: "${result.model}"`);
    return result;
  }
  
  const result = {
    keyType: config.keyType,
    model: keyData.modelId,
    apiKey: keyData.apiKey,
    reason: `Forced routing to: ${category}`,
    category
  };
  
  console.log(`✅ [ROUTING] Model from DB: "${result.model}"`);
  console.log(`🔥 [ROUTING] FINAL MODEL SENT: "${result.model}"`);
  
  return result;
}

/**
 * 🔥 NEW: Auto-detect category and pull from database
 * Returns EXACT model ID from database - NO MODIFICATIONS
 */
export async function detectAndRoute(message: string): Promise<RoutingResult> {
  console.log(`\n🔥 [ROUTING] Auto-routing for message: "${message.substring(0, 50)}..."`);
  
  const category = detectCategory(message);
  const config = KEY_TYPE_MAP[category];
  
  console.log(`🎯 [ROUTING] Detected category: ${category}`);
  console.log(`🔍 [ROUTING] Fetching key and model from DB for: ${config.keyType}`);
  
  const keyData = await getKeyAndModel(config.keyType);
  
  if (!keyData) {
    console.warn(`⚠️ [ROUTING] Key/Model not found for ${config.keyType}, using Main Brain fallback`);
    const mainBrainConfig = KEY_TYPE_MAP['main_brain'];
    const fallbackData = await getKeyAndModel(mainBrainConfig.keyType);
    
    if (!fallbackData) {
      throw new Error(`API key and model missing for: ${config.keyType}`);
    }
    
    const result = {
      keyType: mainBrainConfig.keyType,
      model: fallbackData.modelId,
      apiKey: fallbackData.apiKey,
      reason: `Auto-detected: ${category}, but key not found. Using Main Brain fallback.`,
      category: 'main_brain'
    };
    
    console.log(`✅ [ROUTING] Fallback model from DB: "${result.model}"`);
    return result;
  }
  
  const result = {
    keyType: config.keyType,
    model: keyData.modelId,
    apiKey: keyData.apiKey,
    reason: `Auto-detected: ${category}`,
    category
  };
  
  console.log(`✅ [ROUTING] Model from DB: "${result.model}"`);
  console.log(`🔥 [ROUTING] FINAL MODEL SENT: "${result.model}"`);
  
  return result;
}

/**
 * Get all available model categories with their status
 */
export async function getAvailableModels(): Promise<Array<{ category: string; description: string; hasKey: boolean }>> {
  const results = [];
  
  for (const [category, config] of Object.entries(KEY_TYPE_MAP)) {
    const keyData = await getKeyAndModel(config.keyType);
    results.push({
      category,
      description: config.description,
      hasKey: !!keyData
    });
  }
  
  return results;
}