import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from '../database/schemas/conversation.schema';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable()
export class ConversationHistoryService {
  private readonly logger = new Logger(ConversationHistoryService.name);
  private readonly maxMessagesPerSession = 50;

  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
  ) {}

  async createSession(userId?: string): Promise<string> {
    const sessionId = this.generateSessionId();
    const conversation = new this.conversationModel({
      sessionId,
      userId,
      messages: [],
    });

    await conversation.save();
    this.logger.log(`Created new conversation session: ${sessionId}`);
    return sessionId;
  }

  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<void> {
    const conversation = await this.conversationModel.findOne({ sessionId });
    if (!conversation) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const message = {
      role,
      content,
      timestamp: new Date(),
    };

    conversation.messages.push(message);

    // Limit messages per session
    if (conversation.messages.length > this.maxMessagesPerSession) {
      conversation.messages = conversation.messages.slice(
        -this.maxMessagesPerSession,
      );
    }

    conversation.updatedAt = new Date();
    await conversation.save();
  }

  async getSession(sessionId: string): Promise<ConversationDocument | null> {
    return await this.conversationModel.findOne({ sessionId }).exec();
  }

  async getRecentMessages(
    sessionId: string,
    limit: number = 10,
  ): Promise<ConversationMessage[]> {
    const conversation = await this.conversationModel
      .findOne({ sessionId })
      .exec();
    if (!conversation) {
      return [];
    }

    return conversation.messages.slice(-limit);
  }

  async getConversationContext(
    sessionId: string,
    maxMessages: number = 5,
  ): Promise<string> {
    const messages = await this.getRecentMessages(sessionId, maxMessages);

    if (messages.length === 0) {
      return '';
    }

    return messages
      .map(
        (msg) =>
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`,
      )
      .join('\n');
  }

  async getAllSessions(userId?: string): Promise<ConversationDocument[]> {
    const query = userId ? { userId } : {};
    return await this.conversationModel
      .find(query)
      .sort({ updatedAt: -1 })
      .exec();
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.conversationModel.deleteOne({ sessionId }).exec();
  }

  async getPopularTopics(limit: number = 10): Promise<string[]> {
    const topics = await this.conversationModel.aggregate([
      { $match: { 'metadata.topic': { $exists: true, $ne: null } } },
      { $group: { _id: '$metadata.topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return topics.map((t) => t._id);
  }

  async getCommonQuestions(limit: number = 10): Promise<string[]> {
    const questions = await this.conversationModel.aggregate([
      { $unwind: '$messages' },
      { $match: { 'messages.role': 'user' } },
      {
        $group: {
          _id: { $toLower: '$messages.content' },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $gt: [{ $strLenCP: '$_id' }, 10] },
              { $lt: [{ $strLenCP: '$_id' }, 200] },
            ],
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return questions.map((q) => q._id);
  }

  async getAllUserMessages(
    limit: number = 1000,
  ): Promise<ConversationMessage[]> {
    const conversations = await this.conversationModel
      .find()
      .select('messages')
      .limit(limit)
      .exec();

    const allMessages: ConversationMessage[] = [];
    conversations.forEach((conv) => {
      const userMessages = conv.messages.filter((m) => m.role === 'user');
      allMessages.push(...userMessages);
    });

    return allMessages;
  }

  async updateSessionMetadata(
    sessionId: string,
    metadata: Partial<Conversation['metadata']>,
  ): Promise<void> {
    const conversation = await this.conversationModel.findOne({ sessionId });
    if (!conversation) {
      throw new Error(`Session ${sessionId} not found`);
    }

    conversation.metadata = {
      ...conversation.metadata,
      ...metadata,
    };
    conversation.updatedAt = new Date();
    await conversation.save();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
