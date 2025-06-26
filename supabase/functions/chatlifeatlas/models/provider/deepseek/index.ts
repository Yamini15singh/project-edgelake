import { AIModel, AIModelConfig, AIModelResponse } from "../types.ts";
import { ModelError } from "../../../../errors.ts";

export class DeepSeekModel implements AIModel {
  private config: AIModelConfig;
  private baseUrl = "https://api.deepseek.com/v1/chat/completions";

  constructor(config: AIModelConfig) {
    this.config = config;
  }

  async generateResponse(systemPrompt: string, userMessage: string): Promise<AIModelResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages: [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": userMessage }
        ],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new ModelError(
          `DeepSeek API error: ${errorData.error?.message || "Unknown error"}`,
          { status: response.status, response: errorData }
        );
      } catch (jsonError) {
        throw new ModelError(
          `DeepSeek API error (${response.status})`,
          { status: response.status, response: errorText }
        );
      }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices.length || !data.choices[0].message) {
      throw new ModelError("Invalid response structure from DeepSeek", { response: data });
    }

    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  }
} 