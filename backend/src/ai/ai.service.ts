import { Injectable, Logger } from '@nestjs/common';
import { HuggingFaceAiService } from './huggingface-ai.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly huggingFaceService: HuggingFaceAiService) {}

  async generateResponse(
    userMessage: string,
    context?: string,
    conversationHistory?: string,
  ): Promise<string> {
    try {
      return await this.huggingFaceService.generateResponse(
        userMessage,
        context,
        conversationHistory,
      );
    } catch (error) {
      this.logger.error('Error generating AI response', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  async checkModelAvailability(): Promise<boolean> {
    return await this.huggingFaceService.checkModelAvailability();
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
}
