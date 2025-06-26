import { AIModel, AIModelConfig, AIProvider } from "./provider/types.ts";
import { OpenAIModel } from "./provider/open-ai/index.ts";
import { GeminiModel } from "./provider/gemini/index.ts";
import { DeepSeekModel } from "./provider/deepseek/index.ts";
import { ClaudeModel } from "./provider/claude/index.ts";

/**
 * Creates an instance of an AI model based on the specified provider
 * 
 * @param {AIProvider} provider - The AI provider to use (openai, gemini, deepseek, or claude)
 * @param {AIModelConfig} config - Configuration for the AI model
 * @returns {AIModel} An instance of the specified AI model
 * @throws {Error} If an unsupported AI provider is specified
 * 
 * @example
 * const config = {
 *   apiKey: "your-api-key",
 *   modelName: "gpt-4",
 *   temperature: 0.7,
 *   maxTokens: 500
 * };
 * const model = createAIModel('openai', config);
 */
export function createAIModel(provider: AIProvider, config: AIModelConfig): AIModel {
    switch (provider) {
      case AIProvider.OPENAI:
        return new OpenAIModel(config);
      case AIProvider.GEMINI:
        return new GeminiModel(config);
      case AIProvider.DEEPSEEK:
        return new DeepSeekModel(config);
      case AIProvider.CLAUDE:
        return new ClaudeModel(config);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } 