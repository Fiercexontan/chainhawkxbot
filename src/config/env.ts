import 'dotenv/config';

interface AppConfig {
  botToken: string;
  nodeEnv: 'development' | 'production' | 'test';
  logLevel: string;
}

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Fail fast: if config is broken, we want to know at startup,
// not three commands into a user's conversation.
export const config: AppConfig = {
  botToken: required('BOT_TOKEN'),
  nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
};
