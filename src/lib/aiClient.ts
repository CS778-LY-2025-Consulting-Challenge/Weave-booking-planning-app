import OpenAI from 'openai';

/**
 * Universal AI Client
 * Supports Groq API (Primary - Free & Fast) and OpenAI API (Fallback)
 * Documentation:
 * - Groq: https://console.groq.com/docs
 * - OpenAI: https://platform.openai.com/docs
 */

export interface AIClientConfig {
  client: OpenAI;
  model: string;
  provider: 'groq' | 'openai';
  isConfigured: boolean;
}

export function getAIClient(overrideModel?: string): AIClientConfig {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  // Prioritize Groq if GROQ_API_KEY is available (or if specifically configured)
  const useGroq = Boolean(groqKey);

  if (useGroq && groqKey) {
    const client = new OpenAI({
      apiKey: groqKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    const model = overrideModel || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    return {
      client,
      model,
      provider: 'groq',
      isConfigured: true,
    };
  }

  if (openaiKey) {
    const client = new OpenAI({
      apiKey: openaiKey,
    });
    const model = overrideModel || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    return {
      client,
      model,
      provider: 'openai',
      isConfigured: true,
    };
  }

  // Not configured - return dummy client with clear error on invocation
  const dummyClient = new OpenAI({
    apiKey: 'missing-key',
  });

  return {
    client: dummyClient,
    model: 'openai/gpt-oss-120b',
    provider: 'groq',
    isConfigured: false,
  };
}

export interface ChatCompletionOptions {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  response_format?: { type: 'json_object' | 'text' };
  max_tokens?: number;
  temperature?: number;
  model?: string;
}

/**
 * Safely parse JSON from raw text or markdown code fence, or wrap plain text in valid JSON
 */
export function extractOrWrapJson(rawText: string): any {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { reply: 'How can I help you with your travel plans?', plannerState: {} };
  }

  // 1. Direct JSON parse
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 2. Markdown fenced code block (```json ... ``` or ``` ...)
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {}
  }

  // 3. Find outer braces { ... }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {}
  }

  // 4. Fallback: Wrap conversational text in expected format
  return {
    reply: trimmed,
    plannerState: {},
  };
}

/**
 * Robust chat completion wrapper handling provider-specific nuances
 * - Handles Groq json_validate_failed by extracting failed_generation or retrying without strict grammar
 * - Provides automatic fallback across models and providers
 */
export async function createAIChatCompletion(options: ChatCompletionOptions) {
  const ai = getAIClient(options.model);

  if (!ai.isConfigured) {
    throw new Error(
      'AI API key is missing. Please add GROQ_API_KEY to your .env.local file. Get a free key at https://console.groq.com/keys'
    );
  }

  const messages = [...options.messages];

  // Groq requirement: When response_format is json_object, at least one message must contain the word "json"
  if (ai.provider === 'groq' && options.response_format?.type === 'json_object') {
    const hasJsonWord = messages.some(m => m.content.toLowerCase().includes('json'));
    if (!hasJsonWord) {
      messages.unshift({
        role: 'system',
        content: 'You must respond with a valid JSON object.',
      });
    }
  }

  let maxTokens = options.max_tokens;
  if (ai.provider === 'groq') {
    if (!maxTokens || maxTokens > 16000) {
      maxTokens = 16000;
    }
  }

  // Helper to construct a synthetic OpenAI response from extracted JSON
  const makeSyntheticResponse = (contentObj: any) => ({
    id: `groq-recovered-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: ai.model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: JSON.stringify(contentObj),
        },
        finish_reason: 'stop',
      },
    ],
  });

  try {
    console.log(`[AIClient] Calling ${ai.provider} with model ${ai.model}`);
    const response = await ai.client.chat.completions.create({
      model: ai.model,
      messages: messages as any,
      response_format: options.response_format as any,
      max_tokens: maxTokens,
      temperature: options.temperature ?? 0.7,
    });
    return response;
  } catch (primaryErr: any) {
    console.warn(`[AIClient] ${ai.provider} initial attempt failed:`, primaryErr?.message || primaryErr);

    // 1. Check if Groq returned failed_generation in the error
    const failedGeneration =
      primaryErr?.error?.failed_generation ||
      primaryErr?.failed_generation ||
      (typeof primaryErr?.error === 'object' && primaryErr?.error?.failed_generation);

    if (failedGeneration && typeof failedGeneration === 'string' && failedGeneration.trim().length > 10) {
      console.log('[AIClient] Recovering response from Groq failed_generation payload');
      const recovered = extractOrWrapJson(failedGeneration);
      return makeSyntheticResponse(recovered);
    }

    // 2. If Groq failed due to json_validate_failed, 400, or grammar constraint, retry WITHOUT response_format
    if (ai.provider === 'groq') {
      const isJsonError =
        primaryErr?.status === 400 ||
        primaryErr?.error?.code === 'json_validate_failed' ||
        String(primaryErr?.message).includes('Failed to generate JSON') ||
        String(primaryErr?.message).includes('400');

      if (isJsonError) {
        try {
          console.log('[AIClient] Retrying Groq without strict response_format grammar...');
          const retryMessages = [...messages];
          // Ensure prompt reminds model to return JSON without activating Groq's grammar validator
          if (!retryMessages.some(m => m.content.includes('valid JSON object'))) {
            retryMessages.unshift({
              role: 'system',
              content: 'You must respond with a valid JSON object matching the requested schema.',
            });
          }

          const unconstrainedResponse = await ai.client.chat.completions.create({
            model: ai.model,
            messages: retryMessages as any,
            // Omit response_format so Groq does not abort during generation
            max_tokens: maxTokens,
            temperature: options.temperature ?? 0.7,
          });

          const rawContent = unconstrainedResponse.choices[0]?.message?.content || '';
          const parsed = extractOrWrapJson(rawContent);
          return makeSyntheticResponse(parsed);
        } catch (unconstrainedErr) {
          console.warn('[AIClient] Groq unconstrained retry failed:', unconstrainedErr);
        }

        // Try secondary Groq model (openai/gpt-oss-20b)
        if (ai.model !== 'openai/gpt-oss-20b') {
          try {
            console.log('[AIClient] Retrying Groq with openai/gpt-oss-20b (unconstrained)...');
            const retry20b = await ai.client.chat.completions.create({
              model: 'openai/gpt-oss-20b',
              messages: messages as any,
              max_tokens: maxTokens,
              temperature: options.temperature ?? 0.7,
            });
            const rawContent = retry20b.choices[0]?.message?.content || '';
            const parsed = extractOrWrapJson(rawContent);
            return makeSyntheticResponse(parsed);
          } catch (retry20bErr) {
            console.warn('[AIClient] Groq openai/gpt-oss-20b retry failed:', retry20bErr);
          }
        }
      }
    }

    // 3. If OpenAI key is available, attempt fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        console.warn('[AIClient] Falling back to OpenAI gpt-4o-mini...');
        const fallbackClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const fallbackResponse = await fallbackClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: options.messages as any,
          response_format: options.response_format as any,
          max_tokens: options.max_tokens ?? 16000,
          temperature: options.temperature ?? 0.7,
        });
        return fallbackResponse;
      } catch (fallbackErr) {
        console.error('[AIClient] OpenAI fallback also failed:', fallbackErr);
      }
    }

    throw primaryErr;
  }
}
