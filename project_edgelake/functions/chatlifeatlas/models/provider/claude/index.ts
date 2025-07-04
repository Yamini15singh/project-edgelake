import { AIModel, AIModelConfig, AIModelResponse } from "../types.ts";
import { ModelError } from "../../../../errors.ts";

export class ClaudeModel implements AIModel {
  private config: AIModelConfig;
  private baseUrl = "https://api.anthropic.com/v1/messages";

  constructor(config: AIModelConfig) {
    this.config = config;
  }

  async generateResponse(systemPrompt: string, userMessage: string): Promise<AIModelResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages: [
          { "role": "user", "content": `${systemPrompt}\n\n${userMessage}` }
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
          `Claude API error: ${errorData.error?.message || "Unknown error"}`,
          { status: response.status, response: errorData }
        );
      } catch (jsonError) {
        throw new ModelError(
          `Claude API error (${response.status})`,
          { status: response.status, response: errorText }
        );
      }
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new ModelError("Invalid response structure from Claude", { response: data });
    }

    return {
      content: data.content[0].text,
      usage: {
        prompt_tokens: data.usage?.input_tokens || 0,
        completion_tokens: data.usage?.output_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0
      }
    };
  }
} 