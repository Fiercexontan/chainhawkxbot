import 'dotenv/config';

interface AppConfig {
  botToken: string;
  nodeEnv: 'development' | 'production' | 'test';
  logLevel: string;
  encryptionSecret: string;
  sepoliaRpcUrl: string;
  bscTestnetRpcUrl: string;
  etherscanApiKey: string;
  flowTestnetRpcUrl: string;
  coingeckoApiKey: string;
}

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function requiredHexKey(key: string, byteLength: number): string {
  const value = required(key);
  if (value.length !== byteLength * 2) {
    throw new Error(
      `${key} must be a ${byteLength}-byte value encoded as hex (${byteLength * 2} characters), got ${value.length}`
    );
  }
  return value;
}

// Fail fast: if config is broken, we want to know at startup,
// not three commands into a user's conversation.
export const config: AppConfig = {
  botToken: required('BOT_TOKEN'),
  nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  encryptionSecret: requiredHexKey('ENCRYPTION_SECRET', 32),
  sepoliaRpcUrl: required('SEPOLIA_RPC_URL'),
  bscTestnetRpcUrl: required('BSC_TESTNET_RPC_URL'),
  etherscanApiKey: required('ETHERSCAN_API_KEY'),
  flowTestnetRpcUrl: required('FLOW_TESTNET_RPC_URL'),
  coingeckoApiKey: required('COINGECKO_API_KEY'),
};