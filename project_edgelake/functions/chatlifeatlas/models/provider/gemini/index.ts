import { AIModel, AIModelConfig, AIModelResponse } from "../types.ts"

export class GeminiModel implements AIModel {
  private config: AIModelConfig;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";


  constructor(config: AIModelConfig) {
    this.config = config;
  }

  async generateResponse(systemPrompt: string, userMessage: string): Promise<AIModelResponse> {
    // const chatURL = `${this.baseUrl}/${this.config.modelName}:generateContent?key=${this.config.apiKey}`;
    const chatURL = `${this.baseUrl}/${this.config.modelName}:generateContent`;
    const response = await fetch(chatURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.config.apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: userMessage }
            ]
          }
        ],
        generationConfig: {
          temperature: this.config.temperature || 0.7,
          maxOutputTokens: this.config.maxTokens || 500,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response structure from Gemini");
    }

    return {
      content: data.candidates[0].content.parts[0].text,
      usage: {
        total_tokens: data.usage?.totalTokens || 0
      }
    };
  }
} 