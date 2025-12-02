import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Add new tables for I AM DEVIL v2.0

export const apiKeys = sqliteTable('api_keys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  keyName: text('key_name').notNull().unique(),
  encryptedValue: text('encrypted_value').notNull(),
  modelId: text('model_id').notNull(), // 🔥 NEW: Store exact model ID from OpenRouter
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
});

export const uiTexts = sqliteTable('ui_texts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  category: text('category').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const splashConfig = sqliteTable('splash_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  videoUrl: text('video_url'),
  backgroundImage: text('background_image'),
  glowColor: text('glow_color'),
  duration: integer('duration').default(3),
  title: text('title'),
  subtitle: text('subtitle'),
  screenShake: integer('screen_shake', { mode: 'boolean' }).default(true),
  fireParticles: integer('fire_particles', { mode: 'boolean' }).default(true),
  fogLayer: integer('fog_layer', { mode: 'boolean' }).default(true),
  loadingMessages: text('loading_messages', { mode: 'json' }),
  updatedAt: text('updated_at').notNull(),
});

export const themes = sqliteTable('themes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  primaryColor: text('primary_color').notNull(),
  accentColor: text('accent_color').notNull(),
  backgroundColor: text('background_color').notNull(),
  glowIntensity: integer('glow_intensity').default(5),
  animationSpeed: text('animation_speed').default('normal'),
  chatBubbleStyle: text('chat_bubble_style').notNull(),
  fontFamily: text('font_family').notNull(),
  devilAccents: integer('devil_accents', { mode: 'boolean' }).default(true),
  smokeDensity: integer('smoke_density').default(5),
  gradientMode: text('gradient_mode').notNull(),
  iconSet: text('icon_set').notNull(),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

export const userThemes = sqliteTable('user_themes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  themeId: integer('theme_id').notNull().references(() => themes.id),
  updatedAt: text('updated_at').notNull(),
});

export const modelRoutingRules = sqliteTable('model_routing_rules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ruleName: text('rule_name').notNull(),
  triggerType: text('trigger_type').notNull(),
  triggerValue: text('trigger_value').notNull(),
  targetModel: text('target_model').notNull(),
  priority: integer('priority').default(0),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
});

export const globalConfig = sqliteTable('global_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const codeExecutionLogs = sqliteTable('code_execution_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  language: text('language').notNull(),
  code: text('code').notNull(),
  output: text('output'),
  error: text('error'),
  cpuUsage: real('cpu_usage'),
  memoryUsage: real('memory_usage'),
  executionTime: real('execution_time'),
  createdAt: text('created_at').notNull(),
});

export const chatLogs = sqliteTable('chat_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  chatId: text('chat_id').notNull(),
  messageRole: text('message_role').notNull(),
  messageContent: text('message_content').notNull(),
  modelUsed: text('model_used'),
  tokensIn: integer('tokens_in'),
  tokensOut: integer('tokens_out'),
  routingReason: text('routing_reason'),
  latency: real('latency'),
  createdAt: text('created_at').notNull(),
});

export const userStats = sqliteTable('user_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  xp: integer('xp').default(0),
  level: integer('level').default(1),
  streak: integer('streak').default(0),
  lastLogin: text('last_login').notNull(),
  badges: text('badges', { mode: 'json' }),
  totalMessages: integer('total_messages').default(0),
  totalFilesUploaded: integer('total_files_uploaded').default(0),
  totalCodeRuns: integer('total_code_runs').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const badges = sqliteTable('badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  badgeName: text('badge_name').notNull().unique(),
  badgeDescription: text('badge_description').notNull(),
  badgeIcon: text('badge_icon').notNull(),
  requirementType: text('requirement_type').notNull(),
  requirementValue: integer('requirement_value').notNull(),
  createdAt: text('created_at').notNull(),
});

export const plugins = sqliteTable('plugins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pluginName: text('plugin_name').notNull().unique(),
  pluginType: text('plugin_type').notNull(),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true),
  config: text('config', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const ragFiles = sqliteTable('rag_files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  chunkCount: integer('chunk_count').default(0),
  extractedText: text('extracted_text'),
  indexedAt: text('indexed_at'),
  createdAt: text('created_at').notNull(),
});

export const systemNotes = sqliteTable('system_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  noteType: text('note_type').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at'),
});

export const analyticsEvents = sqliteTable('analytics_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventType: text('event_type').notNull(),
  userId: text('user_id').notNull(),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});