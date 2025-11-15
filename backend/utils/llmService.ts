/**
 * LLM Service - Interface with Hugging Face and Groq APIs
 */

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Calls Hugging Face's free inference API
 * Uses Meta's Llama model which is excellent for explanations
 * Note: Requires a free Hugging Face API token from https://huggingface.co/settings/tokens
 */
export async function callLLM(request: LLMRequest, apiToken: string): Promise<LLMResponse> {
  const { prompt, systemPrompt, maxTokens = 2048, temperature = 0.7 } = request;

  // Combine system prompt and user prompt
  const fullPrompt = systemPrompt 
    ? `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`
    : `${prompt}`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiToken}`
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: maxTokens,
            temperature: temperature,
            return_full_text: false
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} - ${(errorData as any).error || response.statusText}`);
    }

    const data = await response.json() as any;
    
    // Handle response format
    let content = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      content = data[0].generated_text;
    } else if (data.generated_text) {
      content = data.generated_text;
    } else {
      throw new Error("Unexpected response format");
    }

    return {
      content: content.trim(),
      success: true
    };
  } catch (error) {
    return {
      content: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Alternative: Using Groq's free API (faster inference)
 * Get free API key from https://console.groq.com
 */
export async function callLLMGroq(request: LLMRequest, apiToken: string): Promise<LLMResponse> {
  const { prompt, systemPrompt, maxTokens = 2048, temperature = 0.7 } = request;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiToken}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Free and fast
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const content = data.choices[0]?.message?.content || "";

    return {
      content: content.trim(),
      success: true
    };
  } catch (error) {
    return {
      content: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
