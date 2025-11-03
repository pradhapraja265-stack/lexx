import OpenAI from 'openai';
import { OpenAIRequest, OpenAIResponse, ToneType, MessageMetadata } from '../types';

export class OpenAIService {
  private static instance: OpenAIService;
  private openai: OpenAI;
  private readonly model = 'gpt-4';
  private readonly maxTokens = 1000;
  private readonly temperature = 0.3;

  private constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  private getSystemPrompt(tone: ToneType): string {
    const toneInstructions = {
      formal: 'Use proper grammar, avoid contractions, be respectful and professional. Use sophisticated vocabulary and formal sentence structures.',
      casual: 'Use conversational language, appropriate contractions, and a friendly tone. Write as if talking to a friend.',
      friendly: 'Be warm and approachable with positive language and an encouraging tone. Use inclusive language and show enthusiasm.',
      professional: 'Use business-appropriate language that is clear, concise, and industry-standard. Be direct but polite and maintain a professional demeanor.',
    };

    return `You are LexiFix, an AI assistant that helps refine and improve text to match different tones while maintaining the original meaning.

Guidelines:
- Preserve the core message and intent of the original text
- Adjust vocabulary, sentence structure, and formality level
- ${toneInstructions[tone]}
- Return only the refined text, no explanations or meta-commentary
- Keep the response concise and focused on the refinement
- Do not add greetings or additional context unless it's essential to the tone

Tone-specific instructions:
${toneInstructions[tone]}

Remember: Your role is to refine the given text to match the requested tone, not to have a conversation.`;
  }

  private buildMessages(text: string, tone: ToneType): OpenAIRequest['messages'] {
    return [
      {
        role: 'system',
        content: this.getSystemPrompt(tone),
      },
      {
        role: 'user',
        content: `Please refine this text to have a ${tone} tone:\n\n${text}`,
      },
    ];
  }

  public async refineText(text: string, tone: ToneType): Promise<{
    refinedText: string;
    metadata: MessageMetadata;
  }> {
    const startTime = Date.now();

    try {
      const messages = this.buildMessages(text, tone);

      const request: OpenAIRequest = {
        model: this.model,
        messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      };

      const response = await this.openai.chat.completions.create(request) as OpenAIResponse;

      const refinedText = response.choices[0]?.message?.content?.trim();

      if (!refinedText) {
        throw new Error('No response received from OpenAI');
      }

      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000; // Convert to seconds

      const metadata: MessageMetadata = {
        model: this.model,
        tokensUsed: response.usage.total_tokens,
        processingTime,
      };

      return {
        refinedText,
        metadata,
      };

    } catch (error) {
      console.error('OpenAI API error:', error);

      // Handle specific OpenAI errors
      if (error instanceof Error) {
        if (error.message.includes('insufficient quota')) {
          throw new Error('OpenAI API quota exceeded. Please check your billing.');
        }
        if (error.message.includes('invalid API key')) {
          throw new Error('Invalid OpenAI API key configured.');
        }
        if (error.message.includes('rate limit')) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        }
        if (error.message.includes('model')) {
          throw new Error('Specified OpenAI model not available.');
        }
      }

      throw new Error('Failed to refine text using AI service');
    }
  }

  public async healthCheck(): Promise<{ status: string; model: string }> {
    try {
      // Simple test request to check if OpenAI is accessible
      const response = await this.openai.models.list();
      return {
        status: 'available',
        model: this.model,
      };
    } catch (error) {
      console.error('OpenAI health check failed:', error);
      return {
        status: 'unavailable',
        model: this.model,
      };
    }
  }

  public getSupportedTones(): ToneType[] {
    return ['formal', 'casual', 'friendly', 'professional'];
  }

  public getModelInfo(): { model: string; maxTokens: number; temperature: number } {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
    };
  }

  // Estimate token usage for a given text (rough approximation)
  public estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }

  // Check if text is within reasonable limits
  public validateInput(text: string): { isValid: boolean; error?: string } {
    if (!text || !text.trim()) {
      return { isValid: false, error: 'Text cannot be empty' };
    }

    if (text.length > 5000) {
      return { isValid: false, error: 'Text is too long. Maximum 5000 characters allowed.' };
    }

    if (text.length < 10) {
      return { isValid: false, error: 'Text is too short. Minimum 10 characters required.' };
    }

    const estimatedTokens = this.estimateTokens(text);
    if (estimatedTokens > 4000) {
      return {
        isValid: false,
        error: 'Text is too long for processing. Please shorten your text.'
      };
    }

    return { isValid: true };
  }
}

export const openAIService = OpenAIService.getInstance();