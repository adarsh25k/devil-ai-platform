import { db } from '@/db';
import { themes, plugins, badges, globalConfig, splashConfig, uiTexts } from '@/db/schema';

const defaultThemes = [
  {
    name: "Devil Red",
    primaryColor: "#ff0000",
    accentColor: "#ff4500",
    backgroundColor: "#000000",
    glowIntensity: 8,
    animationSpeed: "normal",
    chatBubbleStyle: "rounded-gradient",
    fontFamily: "system-ui",
    devilAccents: true,
    smokeDensity: 7,
    gradientMode: "linear",
    iconSet: "horns",
    isEnabled: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Demon Purple",
    primaryColor: "#9d00ff",
    accentColor: "#d900ff",
    backgroundColor: "#0a0014",
    glowIntensity: 7,
    animationSpeed: "normal",
    chatBubbleStyle: "rounded-gradient",
    fontFamily: "system-ui",
    devilAccents: true,
    smokeDensity: 6,
    gradientMode: "radial",
    iconSet: "horns",
    isEnabled: true,
    isDefault: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Ghost White",
    primaryColor: "#ffffff",
    accentColor: "#e0e0e0",
    backgroundColor: "#1a1a1a",
    glowIntensity: 5,
    animationSpeed: "slow",
    chatBubbleStyle: "rounded-soft",
    fontFamily: "system-ui",
    devilAccents: false,
    smokeDensity: 9,
    gradientMode: "linear",
    iconSet: "minimal",
    isEnabled: true,
    isDefault: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Hellfire Orange",
    primaryColor: "#ff6600",
    accentColor: "#ffaa00",
    backgroundColor: "#1a0500",
    glowIntensity: 9,
    animationSpeed: "fast",
    chatBubbleStyle: "sharp-gradient",
    fontFamily: "system-ui",
    devilAccents: true,
    smokeDensity: 8,
    gradientMode: "conic",
    iconSet: "flames",
    isEnabled: true,
    isDefault: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Blood Neon",
    primaryColor: "#ff0066",
    accentColor: "#00ffff",
    backgroundColor: "#000000",
    glowIntensity: 10,
    animationSpeed: "fast",
    chatBubbleStyle: "neon-border",
    fontFamily: "system-ui",
    devilAccents: true,
    smokeDensity: 5,
    gradientMode: "linear",
    iconSet: "neon",
    isEnabled: true,
    isDefault: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Abyss Blue",
    primaryColor: "#0066ff",
    accentColor: "#00d9ff",
    backgroundColor: "#000a14",
    glowIntensity: 6,
    animationSpeed: "normal",
    chatBubbleStyle: "rounded-gradient",
    fontFamily: "system-ui",
    devilAccents: false,
    smokeDensity: 7,
    gradientMode: "radial",
    iconSet: "waves",
    isEnabled: true,
    isDefault: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Shadow Black",
    primaryColor: "#333333",
    accentColor: "#666666",
    backgroundColor: "#000000",
    glowIntensity: 3,
    animationSpeed: "slow",
    chatBubbleStyle: "minimal",
    fontFamily: "system-ui",
    devilAccents: false,
    smokeDensity: 4,
    gradientMode: "none",
    iconSet: "minimal",
    isEnabled: true,
    isDefault: false,
    createdAt: new Date().toISOString()
  }
];

const defaultPlugins = [
  {
    pluginName: "DuckDuckGo Search",
    pluginType: "search",
    isEnabled: true,
    config: { maxResults: 5, safeSearch: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    pluginName: "YouTube Transcripts",
    pluginType: "media",
    isEnabled: false,
    config: { language: "en" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    pluginName: "Code Sandbox",
    pluginType: "execution",
    isEnabled: true,
    config: { timeout: 30, memoryLimit: 512 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    pluginName: "Image Generation",
    pluginType: "generation",
    isEnabled: false,
    config: { defaultModel: "dall-e-3" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    pluginName: "RAG Document Search",
    pluginType: "knowledge",
    isEnabled: true,
    config: { maxChunks: 5 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const defaultBadges = [
  {
    badgeName: "First Blood",
    badgeDescription: "Sent your first message to the devil",
    badgeIcon: "🩸",
    requirementType: "messages",
    requirementValue: 1,
    createdAt: new Date().toISOString()
  },
  {
    badgeName: "Chatterbox",
    badgeDescription: "Sent 100 messages",
    badgeIcon: "💬",
    requirementType: "messages",
    requirementValue: 100,
    createdAt: new Date().toISOString()
  },
  {
    badgeName: "Soul Summoner",
    badgeDescription: "Sent 1000 messages",
    badgeIcon: "👹",
    requirementType: "messages",
    requirementValue: 1000,
    createdAt: new Date().toISOString()
  },
  {
    badgeName: "Code Demon",
    badgeDescription: "Executed 50 code snippets",
    badgeIcon: "💻",
    requirementType: "code_runs",
    requirementValue: 50,
    createdAt: new Date().toISOString()
  },
  {
    badgeName: "Knowledge Seeker",
    badgeDescription: "Uploaded 10 files to RAG",
    badgeIcon: "📚",
    requirementType: "files_uploaded",
    requirementValue: 10,
    createdAt: new Date().toISOString()
  },
  {
    badgeName: "Hell's Veteran",
    badgeDescription: "Reached level 10",
    badgeIcon: "⚔️",
    requirementType: "level",
    requirementValue: 10,
    createdAt: new Date().toISOString()
  },
  {
    badgeName: "Streak Master",
    badgeDescription: "Maintained a 7-day streak",
    badgeIcon: "🔥",
    requirementType: "streak",
    requirementValue: 7,
    createdAt: new Date().toISOString()
  }
];

const defaultGlobalConfig = [
  { key: "chat_rate_limit", value: "60", updatedAt: new Date().toISOString() },
  { key: "max_file_upload_size", value: "52428800", updatedAt: new Date().toISOString() }, // 50MB
  { key: "max_rag_chunk_size", value: "500", updatedAt: new Date().toISOString() },
  { key: "default_model", value: "gpt-3.5-turbo", updatedAt: new Date().toISOString() },
  { key: "enable_animations", value: "true", updatedAt: new Date().toISOString() },
  { key: "enable_voice", value: "true", updatedAt: new Date().toISOString() },
  { key: "safety_filters", value: "false", updatedAt: new Date().toISOString() },
  { key: "session_timeout", value: "86400", updatedAt: new Date().toISOString() }, // 24 hours
  { key: "maintenance_mode", value: "false", updatedAt: new Date().toISOString() }
];

const defaultSplashConfig = {
  id: 1,
  videoUrl: null,
  backgroundImage: null,
  glowColor: "#ff0000",
  duration: 3,
  title: "I AM DEVIL",
  subtitle: "v2.0 - Embrace the Darkness",
  screenShake: true,
  fireParticles: true,
  fogLayer: true,
  loadingMessages: ["Summoning demons...", "Loading chaos...", "Igniting hellfire...", "Awakening the devil..."],
  updatedAt: new Date().toISOString()
};

const defaultUiTexts = [
  { key: "splash_title", value: "I AM DEVIL", category: "splash", updatedAt: new Date().toISOString() },
  { key: "splash_subtitle", value: "Enter the Abyss", category: "splash", updatedAt: new Date().toISOString() },
  { key: "splash_loading", value: "Summoning the devil...", category: "splash", updatedAt: new Date().toISOString() },
  { key: "login_title", value: "Enter Hell's Gate", category: "login", updatedAt: new Date().toISOString() },
  { key: "login_placeholder_user", value: "Username", category: "login", updatedAt: new Date().toISOString() },
  { key: "login_placeholder_pass", value: "Password", category: "login", updatedAt: new Date().toISOString() },
  { key: "chat_welcome", value: "Welcome to Hell. How may I torment you today?", category: "chat", updatedAt: new Date().toISOString() },
  { key: "chat_placeholder", value: "Start summoning the devil...", category: "chat", updatedAt: new Date().toISOString() },
  { key: "chat_typing", value: "The devil is thinking...", category: "chat", updatedAt: new Date().toISOString() },
  { key: "button_send", value: "Summon", category: "buttons", updatedAt: new Date().toISOString() },
  { key: "button_new_chat", value: "New Ritual", category: "buttons", updatedAt: new Date().toISOString() },
  { key: "error_generic", value: "The devil encountered an error. Try again.", category: "errors", updatedAt: new Date().toISOString() },
  { key: "error_auth", value: "You are not worthy. Authentication failed.", category: "errors", updatedAt: new Date().toISOString() }
];

export async function seedDefaults() {
  try {
    console.log("🔥 Seeding default themes...");
    for (const theme of defaultThemes) {
      await db.insert(themes).values(theme).onConflictDoNothing();
    }

    console.log("🔌 Seeding default plugins...");
    for (const plugin of defaultPlugins) {
      await db.insert(plugins).values(plugin).onConflictDoNothing();
    }

    console.log("🏆 Seeding default badges...");
    for (const badge of defaultBadges) {
      await db.insert(badges).values(badge).onConflictDoNothing();
    }

    console.log("⚙️ Seeding default global config...");
    for (const config of defaultGlobalConfig) {
      await db.insert(globalConfig).values(config).onConflictDoNothing();
    }

    console.log("🎬 Seeding default splash config...");
    await db.insert(splashConfig).values(defaultSplashConfig).onConflictDoNothing();

    console.log("📝 Seeding default UI texts...");
    for (const text of defaultUiTexts) {
      await db.insert(uiTexts).values(text).onConflictDoNothing();
    }

    console.log("✅ All defaults seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding defaults:", error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedDefaults()
    .then(() => {
      console.log("✨ Seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💀 Seeding failed:", error);
      process.exit(1);
    });
}
