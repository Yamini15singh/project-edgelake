/**
 * Interface for AI model responses.
 * 
 * @interface AIModelResponse
 * @property {string} content - The content of the AI model response
 * @property {Object} usage - The usage information for the AI model response
 */
export interface AIModelResponse {
  content: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * Interface for AI model configuration.
 * 
 * @interface AIModelConfig
 * @property {string} apiKey - The API key for the AI model
 * @property {string} modelName - The name of the AI model
 * @property {number} temperature - The temperature for the AI model
 * @property {number} maxTokens - The maximum number of tokens for the AI model
 */
export interface AIModelConfig {
  apiKey: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
  aiProvider: AIProvider;
}

/**
 * Interface for AI models. All models will implement this interface.
 * 
 * @interface AIModel
 * @method generateResponse - Generates a response from the AI model
 */
export interface AIModel {
  generateResponse(systemPrompt: string, userMessage: string): Promise<AIModelResponse>;
}

/**
 * Enum representing different AI model providers.
 * 
 * @enum {string}
 * @readonly
 * @enum {string}
 */
export enum AIProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
  CLAUDE = 'claude'
}
