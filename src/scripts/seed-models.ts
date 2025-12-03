import { db } from '../db';
import { modelConfig } from '../db/schema';
import { eq } from 'drizzle-orm';

const PREDEFINED_MODELS = [
  {
    category: 'main_brain',
    modelId: 'nousresearch/nous-hermes-3-llama-3-405b',
    displayName: 'Main Brain',
    description: 'Advanced reasoning and complex problem solving',
    icon: '🧠',
  },
  {
    category: 'coding',
    modelId: 'qwen/qwen3-coder-480b-a35b',
    displayName: 'Coding / Full Stack',
    description: 'Expert in coding, debugging, and full-stack development',
    icon: '💻',
  },
  {
    category: 'debugging',
    modelId: 'tngtech/deepseek-r1t2-chimera',
    displayName: 'Debugging',
    description: 'Specialized in finding and fixing bugs',
    icon: '🐛',
  },
  {
    category: 'uiux',
    modelId: 'meta-llama/llama-3.3-70b-instruct:free',
    displayName: 'UI/UX Mockups',
    description: 'Design interfaces and create mockups',
    icon: '🎨',
  },
  {
    category: 'gamedev',
    modelId: 'moonshotai/kimi-k2',
    displayName: 'Game Dev',
    description: 'Game development and interactive experiences',
    icon: '🎮',
  },
  {
    category: 'fast',
    modelId: 'xai/grok-4.1-fast',
    displayName: 'Fast Daily Use',
    description: 'Quick responses for everyday tasks',
    icon: '⚡',
  },
  {
    category: 'canvas',
    modelId: 'meta-llama/llama-3.2-3b-instruct',
    displayName: 'Canvas / PPT / Notes',
    description: 'Create presentations, notes, and documents',
    icon: '📝',
  },
  {
    category: 'image',
    modelId: 'veniceai/uncensored',
    displayName: 'Image Generation',
    description: 'Generate and describe images',
    icon: '🖼️',
  },
];

export async function seedModels() {
  console.log('🌱 Seeding model configurations...');
  
  for (const model of PREDEFINED_MODELS) {
    const existing = await db.select().from(modelConfig).where(eq(modelConfig.category, model.category));
    
    if (existing.length === 0) {
      await db.insert(modelConfig).values({
        ...model,
        isEnabled: true,
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ Added model: ${model.displayName}`);
    } else {
      // Update existing
      await db.update(modelConfig)
        .set({
          modelId: model.modelId,
          displayName: model.displayName,
          description: model.description,
          icon: model.icon,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(modelConfig.category, model.category));
      console.log(`🔄 Updated model: ${model.displayName}`);
    }
  }
  
  console.log('✅ Model seeding complete!');
}

// Run if executed directly
if (require.main === module) {
  seedModels()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
