import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { ConversationHistoryService } from '../conversation-history/conversation-history.service';
import { LearningService } from '../learning/learning.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly knowledgeBaseService: KnowledgeBaseService,
    private readonly conversationHistoryService: ConversationHistoryService,
    private readonly learningService: LearningService,
  ) {}

  async processMessage(
    message: string,
    sessionId?: string,
  ): Promise<{ response: string; sessionId: string }> {
    try {
      // Get or create session
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId =
          await this.conversationHistoryService.createSession();
      }

      // Get conversation history for context
      const conversationContext =
        await this.conversationHistoryService.getConversationContext(
          currentSessionId,
          5, // Last 5 messages for context
        );

      // Get learning patterns from all chat history
      const learningPatterns = await this.learningService.getSimilarPatterns(
        message,
        3,
      );
      const learningContext = this.buildLearningContext(learningPatterns);

      // RAG: Retrieve relevant context from knowledge base using semantic search
      const documentationContext =
        await this.knowledgeBaseService.searchRelevantContext(message, 5);

      // Combine all context (history + learning + documentation)
      const fullContext = this.combineContext(
        conversationContext,
        documentationContext,
        learningContext,
      );

      // Use AI service to generate response with history and learning
      const response = await this.aiService.generateResponse(
        message,
        fullContext,
        conversationContext,
      );

      // Save messages to history
      await this.conversationHistoryService.addMessage(
        currentSessionId,
        'user',
        message,
      );
      await this.conversationHistoryService.addMessage(
        currentSessionId,
        'assistant',
        response,
      );

      // Update session metadata based on message content
      const metadata = await this.updateSessionMetadata(
        currentSessionId,
        message,
      );

      // Automatically learn from this interaction
      await this.learningService.learnFromMessage(
        message,
        response,
        metadata.category,
        metadata.topics,
      );

      return {
        response,
        sessionId: currentSessionId,
      };
    } catch (error) {
      this.logger.error('Error processing message', error);

      // Fallback to rule-based responses
      const fallbackResponse = this.getFallbackResponse(message);
      return {
        response: fallbackResponse,
        sessionId: sessionId || 'fallback',
      };
    }
  }

  private combineContext(
    conversationContext: string,
    documentationContext: string,
    learningContext?: string,
  ): string {
    const parts: string[] = [];

    if (conversationContext) {
      parts.push('Previous Conversation Context:');
      parts.push(conversationContext);
    }

    if (learningContext) {
      if (parts.length > 0) {
        parts.push('\n---\n\n');
      }
      parts.push('Learning from Historical Patterns:');
      parts.push(learningContext);
    }

    if (documentationContext) {
      if (parts.length > 0) {
        parts.push('\n---\n\n');
      }
      parts.push('Relevant Documentation:');
      parts.push(documentationContext);
    }

    return parts.join('\n');
  }

  private buildLearningContext(patterns: any[]): string {
    if (patterns.length === 0) {
      return '';
    }

    const contextParts = patterns.map((pattern) => {
      let context = `Pattern: "${pattern.originalQuery}" (seen ${pattern.frequency} times)\n`;
      if (
        pattern.successfulResponses &&
        pattern.successfulResponses.length > 0
      ) {
        context += `Previously successful response: ${pattern.successfulResponses[pattern.successfulResponses.length - 1]}\n`;
      }
      if (pattern.variations && pattern.variations.length > 1) {
        context += `Similar queries: ${pattern.variations.slice(0, 3).join(', ')}\n`;
      }
      return context;
    });

    return contextParts.join('\n---\n\n');
  }

  private async updateSessionMetadata(
    sessionId: string,
    message: string,
  ): Promise<{ topic?: string; category?: string; topics?: string[] }> {
    const normalizedMessage = message.toLowerCase();
    let topic: string | undefined;
    let category: string | undefined;
    const topics: string[] = [];

    // Determine topic and category from message
    if (normalizedMessage.includes('dashboard')) {
      topic = 'Dashboards';
      category = 'Navigation';
      topics.push('Dashboards', 'Navigation');
    } else if (normalizedMessage.includes('alert')) {
      topic = 'Alerts';
      category = 'Security';
      topics.push('Alerts', 'Security');
    } else if (normalizedMessage.includes('anomaly')) {
      topic = 'Anomalies';
      category = 'tbUEBA';
      topics.push('Anomalies', 'tbUEBA', 'Behavior');
    } else if (normalizedMessage.includes('rule')) {
      topic = 'Rules';
      category = 'Configuration';
      topics.push('Rules', 'Configuration', 'Detection');
    } else if (normalizedMessage.includes('investigation')) {
      topic = 'Investigations';
      category = 'Security';
      topics.push('Investigations', 'Security', 'Cases');
    } else if (normalizedMessage.includes('report')) {
      topic = 'Reports';
      category = 'Analytics';
      topics.push('Reports', 'Analytics', 'Summary');
    } else if (
      normalizedMessage.includes('tbsiem') ||
      normalizedMessage.includes('siem')
    ) {
      topic = 'tbSIEM';
      category = 'SIEM';
      topics.push('tbSIEM', 'SIEM', 'Logs', 'Threats');
    } else if (
      normalizedMessage.includes('tbueba') ||
      normalizedMessage.includes('ueba')
    ) {
      topic = 'tbUEBA';
      category = 'UEBA';
      topics.push('tbUEBA', 'UEBA', 'Behavior', 'Analytics');
    }

    if (topic || category) {
      await this.conversationHistoryService.updateSessionMetadata(sessionId, {
        topic,
        category,
        tags: topics,
      });
    }

    return { topic, category, topics };
  }

  private getFallbackResponse(message: string): string {
    const normalizedMessage = message.toLowerCase().trim();

    // Handle different types of queries
    if (this.isGreeting(normalizedMessage)) {
      return this.handleGreeting();
    }

    if (this.isAboutQuery(normalizedMessage)) {
      return this.handleAboutQuery();
    }

    if (this.isDashboardQuery(normalizedMessage)) {
      return this.handleDashboardQuery();
    }

    if (this.isAlertQuery(normalizedMessage)) {
      return this.handleAlertQuery();
    }

    if (this.isAnomalyQuery(normalizedMessage)) {
      return this.handleAnomalyQuery();
    }

    if (this.isRuleQuery(normalizedMessage)) {
      return this.handleRuleQuery();
    }

    if (this.isInvestigationQuery(normalizedMessage)) {
      return this.handleInvestigationQuery();
    }

    if (this.isReportQuery(normalizedMessage)) {
      return this.handleReportQuery();
    }

    if (this.isTbSIEMQuery(normalizedMessage)) {
      return this.handleTbSIEMQuery();
    }

    if (this.isTbUEBAQuery(normalizedMessage)) {
      return this.handleTbUEBAQuery();
    }

    // Default response for unclear queries
    return this.handleDefaultQuery();
  }

  private isGreeting(message: string): boolean {
    const greetings = [
      'hi',
      'hello',
      'hey',
      'greetings',
      'good morning',
      'good afternoon',
      'good evening',
    ];
    return greetings.some((greeting) => message.includes(greeting));
  }

  private isAboutQuery(message: string): boolean {
    return (
      message.includes('what') &&
      (message.includes('cybersio') ||
        message.includes('this') ||
        message.includes('you'))
    );
  }

  private isDashboardQuery(message: string): boolean {
    return (
      message.includes('dashboard') ||
      message.includes('view') ||
      message.includes('overview')
    );
  }

  private isAlertQuery(message: string): boolean {
    return (
      message.includes('alert') ||
      message.includes('alerts') ||
      message.includes('notification')
    );
  }

  private isAnomalyQuery(message: string): boolean {
    return (
      message.includes('anomaly') ||
      message.includes('anomalies') ||
      message.includes('unusual')
    );
  }

  private isRuleQuery(message: string): boolean {
    return (
      message.includes('rule') ||
      message.includes('rules') ||
      message.includes('detection')
    );
  }

  private isInvestigationQuery(message: string): boolean {
    return (
      message.includes('investigation') ||
      message.includes('investigate') ||
      message.includes('case')
    );
  }

  private isReportQuery(message: string): boolean {
    return (
      message.includes('report') ||
      message.includes('reports') ||
      message.includes('generate')
    );
  }

  private isTbSIEMQuery(message: string): boolean {
    return message.includes('tbsiem') || message.includes('siem');
  }

  private isTbUEBAQuery(message: string): boolean {
    return message.includes('tbueba') || message.includes('ueba');
  }

  private handleGreeting(): string {
    return "Hello! I'm CyberSIO Assistant, your intelligent help agent for the CyberSIO Platform. I can help you with tbSIEM, tbUEBA, dashboards, alerts, anomalies, rules, investigations, and reports. What would you like to know?";
  }

  private handleAboutQuery(): string {
    return "I'm CyberSIO Assistant, an intelligent help agent for the CyberSIO Platform (tbSIEM & tbUEBA). I can guide you through the platform's features and help you navigate the UI. How can I assist you today?";
  }

  private handleDashboardQuery(): string {
    return "To access dashboards in CyberSIO:\n1. Navigate to the 'Dashboards' section from the main menu\n2. Select the dashboard you want to view\n3. Use the filters and time range selectors to customize your view\n4. Click on any widget to drill down into details\n\nWhich dashboard are you looking for?";
  }

  private handleAlertQuery(): string {
    return "To work with alerts:\n1. Go to the 'Alerts' section from the main navigation\n2. View the list of active alerts\n3. Click on an alert to see details\n4. Use filters to find specific alerts\n5. Take actions like acknowledge, resolve, or assign\n\nWhat would you like to do with alerts?";
  }

  private handleAnomalyQuery(): string {
    return "To view anomalies:\n1. Navigate to the 'Anomalies' section (usually in tbUEBA)\n2. Review the anomaly detection results\n3. Click on an anomaly to investigate further\n4. Use the timeline view to understand the sequence of events\n\nWould you like help investigating a specific anomaly?";
  }

  private handleRuleQuery(): string {
    return "To manage detection rules:\n1. Go to 'Rules' or 'Detection Rules' in the main menu\n2. View existing rules or create new ones\n3. Click on a rule to edit its configuration\n4. Test rules before enabling them\n5. Monitor rule performance from the rules dashboard\n\nWhat would you like to do with rules?";
  }

  private handleInvestigationQuery(): string {
    return "To start or manage investigations:\n1. Navigate to the 'Investigations' section\n2. Click 'New Investigation' to create a case\n3. Add evidence, notes, and findings\n4. Link related alerts and anomalies\n5. Track investigation status and assign team members\n\nNeed help with a specific investigation task?";
  }

  private handleReportQuery(): string {
    return "To generate reports:\n1. Go to the 'Reports' section from the main menu\n2. Select a report template or create a custom report\n3. Configure report parameters (time range, filters, etc.)\n4. Preview the report before generating\n5. Schedule reports for automatic delivery\n\nWhat type of report are you looking to create?";
  }

  private handleTbSIEMQuery(): string {
    return 'tbSIEM (Threat-Based SIEM) is the Security Information and Event Management module of CyberSIO. Key features:\n- Log collection and analysis\n- Threat detection and correlation\n- Incident management\n- Compliance reporting\n\nNavigate to the tbSIEM section from the main menu to access these features. What specific tbSIEM functionality do you need help with?';
  }

  private handleTbUEBAQuery(): string {
    return 'tbUEBA (Threat-Based User and Entity Behavior Analytics) is the behavioral analytics module. Key features:\n- User behavior profiling\n- Anomaly detection\n- Risk scoring\n- Entity timeline analysis\n\nAccess tbUEBA from the main menu. The system analyzes user and entity behaviors to identify potential threats. What would you like to know about tbUEBA?';
  }

  private handleDefaultQuery(): string {
    return "I understand you're asking about the CyberSIO platform. Could you provide more details about what you're trying to do? I can help with:\n- Navigating dashboards\n- Managing alerts and anomalies\n- Working with detection rules\n- Creating investigations\n- Generating reports\n- Using tbSIEM and tbUEBA features\n\nWhat specific task can I help you with?";
  }
}
