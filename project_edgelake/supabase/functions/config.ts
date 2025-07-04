import { load as loadEnv } from "https://deno.land/std@0.192.0/dotenv/mod.ts";

// Detect if the runtime is Deno or Node.js
const isDeno = typeof Deno !== "undefined";
const isNode = typeof process !== "undefined" && process.versions?.node;

// Load environment variables for Deno or Node.js
if (isDeno) {
  const env = await loadEnv();
  for (const [key, value] of Object.entries(env)) {
    Deno.env.set(key, value);
  }
} else if (isNode && process.env.APP_ENV === "dev") {
  // Use dotenv for Node.js in development mode
  const dotenv = await import("dotenv");
  dotenv.config();
}
/**b
 * Configuration interface for the ChatLifeAtlas application
 * 
 * @interface Config
 * @property {object} ai - AI provider configuration
 * @property {string} ai.provider - The AI provider to use (openai, gemini, deepseek, or claude)
 * @property {object} ai.openai - OpenAI specific configuration
 * @property {string} ai.openai.apiKey - OpenAI API key
 * @property {string} ai.openai.modelName - OpenAI model name to use
 * @property {object} ai.gemini - Google Gemini specific configuration  
 * @property {string} ai.gemini.apiKey - Gemini API key
 * @property {string} ai.gemini.modelName - Gemini model name to use
 * @property {object} ai.deepseek - DeepSeek specific configuration
 * @property {string} ai.deepseek.apiKey - DeepSeek API key
 * @property {string} ai.deepseek.modelName - DeepSeek model name to use
 * @property {object} ai.claude - Claude/Anthropic specific configuration
 * @property {string} ai.claude.apiKey - Claude API key
 * @property {string} ai.claude.modelName - Claude model name to use
 * @property {number} [ai.temperature] - Temperature parameter for response generation
 * @property {number} [ai.maxTokens] - Maximum tokens for response generation
 * @property {object} supabase - Supabase configuration
 * @property {string} supabase.url - Supabase project URL
 * @property {string} supabase.anonKey - Supabase anonymous key
 */

export interface Config {
  ai: {
    provider: string; // the usable provider
    openai: {
      apiKey: string;
      modelName: string;
    };
    gemini: {
      apiKey: string;
      modelName: string;
    };
    deepseek: {
      apiKey: string;
      modelName: string;
    };
    claude: {
      apiKey: string;
      modelName: string;
    };
    temperature?: number;
    maxTokens?: number;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
}

/**
 * Gets the application configuration from environment variables
 * 
 * @returns {Config} The application configuration object containing AI and Supabase settings
 * @example
 * const config = getConfig();
 * console.log(config.ai.provider); // "openai"
 * console.log(config.supabase.url); // "https://project.supabase.co"
 * 
 * @throws {Error} If required environment variables are missing
 */

export function getConfig(): Config {

  const appEnv = isDeno ?  Deno.env.get("APP_ENV"):  process.env["APP_ENV"] || "dev";
  const defaultEnv = appEnv === "dev" ? "dev" : "prod";

  // Get environment variable based on the environment (Deno or Node.js)
  // If the environment is dev, use Node.js process.env, otherwise use Deno.env
  // If the environment variable is not set, throw an error
  const getEnv = (key: string, appEnv: string=defaultEnv,  defaultValue: string = ""): string => {
    return isDeno ? Deno.env.get(key):   getKeyWithEnv(appEnv, key)  ||    defaultValue;
  };
  // Get environment variable as a number
  // If the environment variable is not set, return the default value
  // If the environment variable is set but not a number, return the default value
  const getEnvNumber = (key: string, appEnv: string=defaultEnv, defaultValue: number): number => {
    const value = isDeno ?  Deno.env.get(key)  : getKeyWithEnv(appEnv, key)  ||  defaultValue;
    return value ? Number(value) : defaultValue;
  };


  return {
    ai: {
      provider: getEnv("AI_PROVIDER", "openai"),
      openai: {
        apiKey: getEnv("OPENAI_API_KEY"),
        modelName: getEnv("OPENAI_MODEL_NAME", "gpt-4o-mini"),
      },
      gemini: {
        apiKey: getEnv("GEMINI_API_KEY"),
        modelName: getEnv("GEMINI_MODEL_NAME", "gemini-pro"),
      },
      deepseek: {
        apiKey: getEnv("DEEPSEEK_API_KEY"),
        modelName: getEnv("DEEPSEEK_MODEL_NAME", "deepseek-chat"),
      },
      claude: {
        apiKey: getEnv("CLAUDE_API_KEY"),
        modelName: getEnv("CLAUDE_MODEL_NAME", "claude-3-opus-20240229"),
      },
      temperature: getEnvNumber("AI_TEMPERATURE",appEnv, 0.7),
      maxTokens: getEnvNumber("AI_MAX_TOKENS", appEnv, 500),
    },
    supabase: {
      url: getEnv("SUPABASE_URL"),
      anonKey: getEnv("SUPABASE_ANON_KEY"),
      serviceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    },
  };
}

/**
 * Retrieves the API key for the specified AI provider from the configuration
 * @param config - The configuration object containing AI provider settings
 * 
 * @returns {string} The API key for the specified AI provider
 */
export function getProviderApiKey(config: Config): string {
  const providerName: string = config.ai.provider.toLowerCase();

  // Map of providers to their respective API key fields
  const providerApiKeys: Record<string, string | undefined> = {
    openai: config.ai.openai.apiKey,
    gemini: config.ai.gemini.apiKey,
    deepseek: config.ai.deepseek.apiKey,
    claude: config.ai.claude.apiKey,
  };

  const apiKey = providerApiKeys[providerName];

  if (!apiKey) {
    throw new Error(`API key for provider "${providerName}" is not defined.`);
  }
  console.log("Provider API Key:", apiKey);

  return apiKey;
}

/**
 * Retrieves the API key and model name for the specified AI provider from the configuration.
 * 
 * @param config - The configuration object containing AI provider settings.
 * 
 * @returns {{ apiKey: string; modelName: string }} An object containing the API key and model name for the specified AI provider.
 * 
 * @throws {Error} If the API key or model name for the specified provider is not defined.
 */
export function getProviderDetails(config: Config): { apiKey: string; modelName: string } {
  const providerName: string = config.ai.provider.toLowerCase();

  // Map of providers to their respective API key and model name fields
  const providerDetails: Record<string, { apiKey: string; modelName: string } | undefined> = {
    openai: { apiKey: config.ai.openai.apiKey, modelName: config.ai.openai.modelName },
    gemini: { apiKey: config.ai.gemini.apiKey, modelName: config.ai.gemini.modelName },
    deepseek: { apiKey: config.ai.deepseek.apiKey, modelName: config.ai.deepseek.modelName },
    claude: { apiKey: config.ai.claude.apiKey, modelName: config.ai.claude.modelName },
  };

  const details = providerDetails[providerName];

  if (!details || !details.apiKey || !details.modelName) {
    throw new Error(`API key or model name for provider "${providerName}" is not defined.`);
  }

  return details;
}

/**
 * Get the environment setting key with the environment prefix
 * 
 * @param env  the environment name
 * @param key the key name
 * @returns 
 */
function  getKeyWithEnv(env: string, key: string): string {
  const envValue= isDeno ?  Deno.env.get(key):  process.env[key]
  if (!envValue) {
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return envValue;
}