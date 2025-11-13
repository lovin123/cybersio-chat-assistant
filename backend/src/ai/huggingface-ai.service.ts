import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InferenceClient } from '@huggingface/inference';
import axios from 'axios';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class HuggingFaceAiService {
  private readonly logger = new Logger(HuggingFaceAiService.name);
  private readonly client: InferenceClient | null;
  private readonly apiKey: string | null;
  private readonly modelName: string;
  private readonly baseUrl: string;
  private useDirectApi: boolean = false;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('HUGGINGFACE_API_KEY') || null;

    // Use the model specified in config or default to the one from the example
    this.modelName =
      this.configService.get<string>('HUGGINGFACE_MODEL') ||
      'meta-llama/Llama-3.1-8B-Instruct:sambanova';

    // Use router endpoint for Inference Providers (required as of 2024)
    this.baseUrl =
      this.configService.get<string>('HUGGINGFACE_ENDPOINT') ||
      'https://router.huggingface.co/hf-inference';

    // Initialize InferenceClient - it automatically uses the new Inference Providers system
    try {
      if (this.apiKey) {
        this.client = new InferenceClient(this.apiKey);
        this.useDirectApi = false;
        this.logger.log(`Using InferenceClient with model: ${this.modelName}`);
      } else {
        this.logger.warn(
          'HUGGINGFACE_API_KEY not configured, will use direct API calls',
        );
        this.client = null;
        this.useDirectApi = true;
      }
    } catch (error) {
      this.logger.warn(
        'Could not initialize InferenceClient, will use direct API calls',
        error,
      );
      this.client = null;
      this.useDirectApi = true;
    }

    this.logger.log(
      `Initialized Hugging Face AI Service with model: ${this.modelName}`,
    );
  }

  async generateResponse(
    userMessage: string,
    context?: string,
    conversationHistory?: string,
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context, conversationHistory);
      const messages = this.buildMessages(
        systemPrompt,
        userMessage,
        conversationHistory,
      );

      // Inference Providers API: Let the system automatically select an available model
      // Generative models now only support chat_completion endpoint
      return await this.generateChatResponse(messages);
    } catch (error) {
      this.logger.error('Error calling Hugging Face API', error);

      // Fallback to rule-based responses
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.logger.warn(
          'Hugging Face API authentication failed, using fallback',
        );
        return this.getFallbackResponse(userMessage);
      }

      if (error.response?.status === 429) {
        this.logger.warn(
          'Hugging Face API rate limit exceeded, using fallback',
        );
        return this.getFallbackResponse(userMessage);
      }

      throw error;
    }
  }

  /**
   * Generate chat response using InferenceClient with specified model
   */
  private async generateChatResponse(messages: ChatMessage[]): Promise<string> {
    try {
      // Primary: Use InferenceClient (handles Inference Providers)
      if (this.client && !this.useDirectApi) {
        try {
          // Use the model with provider specification (e.g., "meta-llama/Llama-3.1-8B-Instruct:sambanova")
          const chatCompletion = await this.client.chatCompletion({
            model: this.modelName,
            messages: messages as any,
            temperature: 0.7,
            max_tokens: 500,
          });

          if (chatCompletion.choices && chatCompletion.choices.length > 0) {
            const message = chatCompletion.choices[0].message;
            if (message?.content) {
              this.logger.debug(
                `Successfully generated response using model: ${this.modelName}`,
              );
              return message.content.trim();
            }
          }
        } catch (clientError: any) {
          // If it's the old endpoint error, switch to router endpoint
          if (
            clientError.message?.includes('api-inference.huggingface.co') ||
            clientError.message?.includes('no longer supported')
          ) {
            this.logger.warn(
              'InferenceClient using deprecated endpoint, switching to router endpoint',
            );
            this.useDirectApi = true;
          } else {
            // Log the error but try direct API as fallback
            this.logger.warn(
              `InferenceClient chatCompletion failed for ${this.modelName}, trying direct API`,
              clientError.message,
            );
            this.useDirectApi = true;
          }
        }
      }

      // Fallback: Direct API call to router endpoint
      return await this.directChatCompletion(messages);
    } catch (error: any) {
      this.logger.error('Chat completion failed', error);

      // Provide helpful error message for Inference Providers
      if (error.response?.status === 404) {
        throw new Error(
          `Model ${this.modelName} may not be available through Inference Providers. Please check your API key permissions and provider settings.`,
        );
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error(
          'Authentication failed. Please check your API key has "Make calls to Inference Providers" permission enabled.',
        );
      }

      throw error;
    }
  }

  private async directChatCompletion(messages: ChatMessage[]): Promise<string> {
    try {
      // Use router endpoint with specified model
      const endpoint = `${this.baseUrl}/v1/chat/completions`;

      const response = await axios.post(
        endpoint,
        {
          model: this.modelName,
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: this.apiKey ? `Bearer ${this.apiKey}` : undefined,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      if (
        response.status === 200 &&
        response.data?.choices &&
        response.data.choices.length > 0
      ) {
        const content = response.data.choices[0].message?.content;
        if (content) {
          this.logger.debug(
            `Successfully generated response using model: ${this.modelName} via router endpoint`,
          );
          return content.trim();
        }
      }

      throw new Error(
        'Invalid response from Hugging Face Inference Providers API',
      );
    } catch (error: any) {
      // Provide specific error messages for Inference Providers
      if (error.response?.status === 404) {
        this.logger.error('No models available through Inference Providers');
        throw new Error(
          'No models available through Inference Providers. Please check your API key permissions and provider settings in your Hugging Face account.',
        );
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        this.logger.error('Authentication failed - check API key permissions');
        throw new Error(
          'Authentication failed. Please ensure your API key has the "Make calls to Inference Providers" permission enabled in your Hugging Face account settings.',
        );
      }

      if (error.response?.status === 410) {
        this.logger.error('Endpoint deprecated');
        throw new Error(
          'The API endpoint is deprecated. Please update to use the router endpoint: https://router.huggingface.co/hf-inference',
        );
      }

      this.logger.error('Direct chat completion failed', error);
      throw error;
    }
  }

  private buildMessages(
    systemPrompt: string,
    userMessage: string,
    conversationHistory?: string,
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Add conversation history if available
    if (conversationHistory) {
      // Parse conversation history and add to messages
      const historyLines = conversationHistory.split('\n');
      for (const line of historyLines) {
        if (line.startsWith('User:')) {
          messages.push({
            role: 'user',
            content: line.replace('User:', '').trim(),
          });
        } else if (line.startsWith('Assistant:')) {
          messages.push({
            role: 'assistant',
            content: line.replace('Assistant:', '').trim(),
          });
        }
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }

  private buildSystemPrompt(
    context?: string,
    conversationHistory?: string,
  ): string {
    const basePrompt = `You are CyberSIO Assistant, an intelligent help agent for the CyberSIO Platform (tbSIEM & tbUEBA). 

Your Responsibilities:
- Understand user questions about tbSIEM, tbUEBA, dashboards, alerts, anomalies, rules, investigations, and reports
- Provide clear, concise guidance based on CyberSIO UI workflows only
- Never display API endpoints, payloads, backend schemas, or system internals
- Explain how to navigate the platform, where to click, and how to complete tasks
- Provide short step-wise help only when required

Behavior Rules:
- Keep answers short, accurate, friendly, and actionable
- Focus on UI steps, not technical implementation
- If the query is unclear, ask a simple clarification question
- If a feature exists, guide the user to the correct module, page, or section
- If the user asks about something unsupported, suggest the closest available capability

Goal: Help users succeed on the CyberSIO platform by giving precise, UI-based answers and smooth guidance without revealing backend implementation details.

Learning from History:
- Use previous conversation context to understand user's ongoing needs
- Maintain consistency with previous responses
- Build upon previous explanations when appropriate
- Remember user preferences and patterns from conversation history`;

    let fullPrompt = basePrompt;

    if (conversationHistory) {
      fullPrompt += `\n\nYou have access to previous conversation history. Use it to provide context-aware responses and maintain conversation continuity.`;
    }

    if (context) {
      fullPrompt += `\n\nRelevant Context from API Documentation:\n${context}\n\nUse this context to provide accurate, detailed guidance.`;
    }

    return fullPrompt;
  }

  private getFallbackResponse(message: string): string {
    const normalizedMessage = message.toLowerCase().trim();

    if (normalizedMessage.includes('dashboard')) {
      return "To access dashboards in CyberSIO:\n1. Navigate to the 'Dashboards' section from the main menu\n2. Select the dashboard you want to view\n3. Use the filters and time range selectors to customize your view\n4. Click on any widget to drill down into details\n\nWhich dashboard are you looking for?";
    }

    if (normalizedMessage.includes('alert')) {
      return "To work with alerts:\n1. Go to the 'Alerts' section from the main navigation\n2. View the list of active alerts\n3. Click on an alert to see details\n4. Use filters to find specific alerts\n5. Take actions like acknowledge, resolve, or assign\n\nWhat would you like to do with alerts?";
    }

    return "I understand you're asking about the CyberSIO platform. Could you provide more details about what you're trying to do? I can help with navigating dashboards, managing alerts and anomalies, working with detection rules, creating investigations, generating reports, and using tbSIEM and tbUEBA features.";
  }

  async checkModelAvailability(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        this.logger.warn('Hugging Face API key not configured');
        return false;
      }

      // Try using InferenceClient with specified model
      if (this.client && !this.useDirectApi) {
        try {
          // Test with chat completion using the specified model
          await this.client.chatCompletion({
            model: this.modelName,
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 1,
          });
          this.logger.log(
            `Inference Providers API is available with model: ${this.modelName}`,
          );
          return true;
        } catch (error: any) {
          // 410 means endpoint is deprecated
          if (
            error.response?.status === 410 ||
            error.message?.includes('api-inference.huggingface.co')
          ) {
            this.logger.warn(
              'InferenceClient using deprecated endpoint, switching to router',
            );
            this.useDirectApi = true;
          } else if (
            error.response?.status === 503 ||
            error.message?.includes('loading')
          ) {
            // Model is loading, still available
            this.logger.log(`Model ${this.modelName} is loading but available`);
            return true;
          }
        }
      }

      // Fallback: try direct API call to router endpoint
      try {
        const response = await axios.post(
          `${this.baseUrl}/v1/chat/completions`,
          {
            model: this.modelName,
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 1,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
            validateStatus: (status) => status < 500, // Accept 503 (model loading) as available
          },
        );

        // 200 = available, 503 = loading (still available)
        if (response.status === 200 || response.status === 503) {
          this.logger.log(
            `Model ${this.modelName} is available via router endpoint`,
          );
          return true;
        }

        return false;
      } catch (error: any) {
        // If model is loading (503), that's still considered available
        if (
          error.response?.status === 503 ||
          error.message?.includes('loading')
        ) {
          this.logger.log(`Model ${this.modelName} is loading but available`);
          return true;
        }
        // 404 means model not available
        if (error.response?.status === 404) {
          this.logger.warn(
            `Model ${this.modelName} not available through Inference Providers`,
          );
          return false;
        }
        // 410 means endpoint deprecated
        if (error.response?.status === 410) {
          this.logger.warn('Endpoint deprecated - using router endpoint');
          return false;
        }
        // For other errors, assume not available
        this.logger.warn(
          'Inference Providers API availability check failed',
          error.message,
        );
        return false;
      }
    } catch (error: any) {
      this.logger.warn(
        'Hugging Face model availability check failed',
        error.message,
      );
      return false;
    }
  }
}
