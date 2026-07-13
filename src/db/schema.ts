import { pgTable, text, timestamp, uuid, varchar, boolean, jsonb } from "drizzle-orm/pg-core";

export const developerPlugins = pgTable("developer_plugins", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  iconUrl: varchar("icon_url", { length: 1024 }),
  mcpServerUrl: varchar("mcp_server_url", { length: 1024 }).notNull(),
  requiresAuth: boolean("requires_auth").default(false).notNull(),
  authType: varchar("auth_type", { length: 50 }), // e.g., 'oauth', 'api_key', 'none'
  clientId: varchar("client_id", { length: 255 }), // for OAuth
  clientSecret: varchar("client_secret", { length: 255 }), // for OAuth
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).default('active').notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  nickname: varchar("nickname", { length: 255 }),
  tone: varchar("tone", { length: 50 }).default('Default'),
  occupation: varchar("occupation", { length: 255 }),
  more_about_you: text("more_about_you"),
  chars: jsonb("chars").default({}),
  location_enabled: boolean("location_enabled").default(false),
  user_location: varchar("user_location", { length: 255 }),
  user_coordinates: varchar("user_coordinates", { length: 100 }),
  memory_enabled: boolean("memory_enabled").default(false),
  custom_instructions: text("custom_instructions"),
  onboarding_completed: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const searchHistory = pgTable("search_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  query: text("query").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
