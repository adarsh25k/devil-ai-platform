/**
 * Intelligent Model Router
 * Analyzes message content and routes to the most appropriate AI model
 */

interface RoutingDecision {
  category: string;
  confidence: number;
  reason: string;
}

const ROUTING_PATTERNS = {
  coding: {
    keywords: [
      'code', 'function', 'class', 'variable', 'algorithm', 'program', 'script',
      'python', 'javascript', 'typescript', 'java', 'c++', 'react', 'node',
      'api', 'database', 'sql', 'frontend', 'backend', 'fullstack', 'developer',
      'implement', 'build', 'create app', 'web app', 'server', 'client',
      'syntax', 'logic', 'loop', 'array', 'object', 'method', 'constructor'
    ],
    patterns: [
      /\b(write|create|build|develop|implement)\s+(a|an|the)?\s*(function|class|program|app|script|api)/i,
      /\b(python|javascript|typescript|java|c\+\+|ruby|php|go|rust)\b/i,
      /\b(react|vue|angular|node|express|django|flask|nextjs)/i,
      /```[\s\S]*```/,  // Code blocks
    ],
  },
  debugging: {
    keywords: [
      'bug', 'error', 'fix', 'broken', 'debug', 'issue', 'problem', 'crash',
      'not working', 'fails', 'exception', 'stack trace', 'TypeError', 'undefined',
      'null', 'syntax error', 'runtime error', 'help me fix', 'what\'s wrong',
      'why doesn\'t', 'troubleshoot', 'resolve'
    ],
    patterns: [
      /\b(fix|debug|solve|resolve|troubleshoot)\s+(this|the|my)?\s*(bug|error|issue|problem)/i,
      /\b(not working|doesn't work|won't work|failing|failed)/i,
      /\b(error|exception|crash|broke)/i,
    ],
  },
  uiux: {
    keywords: [
      'design', 'ui', 'ux', 'interface', 'mockup', 'wireframe', 'prototype',
      'layout', 'color', 'font', 'style', 'component', 'button', 'form',
      'responsive', 'mobile', 'desktop', 'user experience', 'user interface',
      'figma', 'sketch', 'adobe', 'theme', 'brand', 'visual', 'aesthetic'
    ],
    patterns: [
      /\b(design|create|make)\s+(a|an|the)?\s*(ui|interface|mockup|wireframe|prototype)/i,
      /\b(user interface|user experience|ux design|ui design)/i,
      /\b(color scheme|layout|typography|visual design)/i,
    ],
  },
  gamedev: {
    keywords: [
      'game', 'unity', 'unreal', 'godot', 'gamedev', 'sprite', 'animation',
      'physics', 'collision', 'player', 'enemy', 'level', 'score', 'gameplay',
      'character', 'movement', 'controls', '2d', '3d', 'rendering', 'shader',
      'game engine', 'game mechanics', 'game loop'
    ],
    patterns: [
      /\b(game|unity|unreal|godot)\b/i,
      /\b(create|build|make)\s+(a|an|the)?\s*game/i,
      /\b(player|enemy|character|sprite|level)\s+(movement|controls|mechanics)/i,
    ],
  },
  canvas: {
    keywords: [
      'presentation', 'powerpoint', 'ppt', 'slides', 'keynote', 'notes',
      'document', 'outline', 'summary', 'report', 'essay', 'article',
      'write', 'draft', 'content', 'blog', 'post', 'paper', 'thesis'
    ],
    patterns: [
      /\b(create|make|write|draft)\s+(a|an|the)?\s*(presentation|ppt|slides|document|notes|outline)/i,
      /\b(powerpoint|keynote|google slides)/i,
      /\b(write|draft|compose)\s+(an|a)?\s*(essay|article|blog|report)/i,
    ],
  },
  image: {
    keywords: [
      'image', 'picture', 'photo', 'generate image', 'create image', 'draw',
      'illustration', 'art', 'visual', 'graphic', 'render', 'dalle', 'midjourney',
      'stable diffusion', 'artwork', 'portrait', 'landscape', 'icon', 'logo'
    ],
    patterns: [
      /\b(generate|create|make|draw)\s+(an|a)?\s*(image|picture|illustration|artwork)/i,
      /\b(image generation|text to image|ai art)/i,
    ],
  },
  fast: {
    keywords: [
      'quick', 'fast', 'simple', 'short', 'brief', 'summarize', 'explain',
      'what is', 'how to', 'define', 'tell me', 'show me', 'list', 'find'
    ],
    patterns: [
      /\b(quick|fast|brief|short)\s+(question|answer|explanation)/i,
      /\b(what is|what are|who is|when is|where is|why is|how is)/i,
      /\b(summarize|explain|define|describe)/i,
    ],
  },
  main_brain: {
    keywords: [
      'analyze', 'reason', 'think', 'complex', 'detailed', 'comprehensive',
      'explain deeply', 'philosophy', 'theory', 'research', 'academic',
      'compare', 'contrast', 'evaluate', 'critique', 'argue', 'debate'
    ],
    patterns: [
      /\b(analyze|reason|think deeply|complex|detailed analysis)/i,
      /\b(philosophy|theory|research|academic|scientific)/i,
      /\b(compare|contrast|evaluate|critique)/i,
    ],
  },
};

/**
 * Analyzes a message and determines the best model to use
 */
export function routeMessage(message: string): RoutingDecision {
  const lowerMessage = message.toLowerCase();
  const scores: Record<string, { score: number; reasons: string[] }> = {};
  
  // Initialize scores
  for (const category of Object.keys(ROUTING_PATTERNS)) {
    scores[category] = { score: 0, reasons: [] };
  }
  
  // Score based on keywords
  for (const [category, rules] of Object.entries(ROUTING_PATTERNS)) {
    for (const keyword of rules.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        scores[category].score += 1;
        scores[category].reasons.push(`keyword: "${keyword}"`);
      }
    }
    
    // Score based on patterns (give higher weight)
    for (const pattern of rules.patterns) {
      if (pattern.test(message)) {
        scores[category].score += 3;
        scores[category].reasons.push(`pattern match`);
      }
    }
  }
  
  // Message length analysis
  const wordCount = message.split(/\s+/).length;
  if (wordCount < 10) {
    scores.fast.score += 2;
    scores.fast.reasons.push('short message');
  } else if (wordCount > 50) {
    scores.main_brain.score += 1;
    scores.main_brain.reasons.push('long complex message');
  }
  
  // Find best match
  let bestCategory = 'main_brain';
  let bestScore = 0;
  
  for (const [category, data] of Object.entries(scores)) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestCategory = category;
    }
  }
  
  // If no strong match, use fast for simple queries or main_brain for complex
  if (bestScore === 0) {
    if (wordCount < 20) {
      bestCategory = 'fast';
      bestScore = 1;
      scores.fast.reasons.push('default for short query');
    } else {
      bestCategory = 'main_brain';
      bestScore = 1;
      scores.main_brain.reasons.push('default for complex query');
    }
  }
  
  // Calculate confidence (0-100)
  const totalPossibleScore = Math.max(10, wordCount / 5);
  const confidence = Math.min(100, Math.round((bestScore / totalPossibleScore) * 100));
  
  const reasons = scores[bestCategory].reasons.slice(0, 3).join(', ');
  
  console.log('🤖 [INTELLIGENT ROUTING]', {
    category: bestCategory,
    confidence,
    score: bestScore,
    reasons,
    messagePreview: message.substring(0, 100),
  });
  
  return {
    category: bestCategory,
    confidence,
    reason: reasons || 'default routing',
  };
}
