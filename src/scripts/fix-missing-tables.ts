import { db } from '../db';
import { sql } from 'drizzle-orm';

async function fixMissingTables() {
  console.log('🔧 Creating missing database tables...');

  try {
    // Create model_config table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS model_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        category TEXT NOT NULL UNIQUE,
        model_id TEXT NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        is_enabled INTEGER DEFAULT 1,
        updated_at TEXT NOT NULL
      )
    `);
    console.log('✅ Created model_config table');

    // Create chats table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        chat_id TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        is_pinned INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    console.log('✅ Created chats table');

    // Create chat_messages table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        chat_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        model_used TEXT,
        created_at TEXT NOT NULL
      )
    `);
    console.log('✅ Created chat_messages table');

    console.log('🎉 All missing tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  fixMissingTables()
    .then(() => {
      console.log('✨ Database fix complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💀 Database fix failed:', error);
      process.exit(1);
    });
}

export { fixMissingTables };
