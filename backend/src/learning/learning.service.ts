import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from '../database/schemas/conversation.schema';
import {
  LearningPattern,
  LearningPatternDocument,
} from '../database/schemas/learning-patterns.schema';

@Injectable()
export class LearningService {
  private readonly logger = new Logger(LearningService.name);

  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(LearningPattern.name)
    private learningPatternModel: Model<LearningPatternDocument>,
  ) {}

  async learnFromMessage(
    userMessage: string,
    assistantResponse: string,
    category?: string,
    topics?: string[],
  ): Promise<void> {
    try {
      const normalizedPattern = this.normalizeQuery(userMessage);
      const keywords = this.extractKeywords(userMessage);

      // Find or create learning pattern
      let pattern = await this.learningPatternModel.findOne({
        pattern: normalizedPattern,
      });

      if (pattern) {
        // Update existing pattern
        pattern.frequency += 1;
        pattern.lastSeen = new Date();

        // Add variation if different enough
        if (!pattern.variations.includes(userMessage.toLowerCase())) {
          pattern.variations.push(userMessage.toLowerCase());
        }

        // Track successful responses
        if (!pattern.successfulResponses.includes(assistantResponse)) {
          pattern.successfulResponses.push(assistantResponse);
          // Keep only last 10 successful responses
          if (pattern.successfulResponses.length > 10) {
            pattern.successfulResponses =
              pattern.successfulResponses.slice(-10);
          }
        }

        // Update keywords
        keywords.forEach((keyword) => {
          if (!pattern.keywords.includes(keyword)) {
            pattern.keywords.push(keyword);
          }
        });

        if (category) {
          pattern.category = category;
        }

        if (topics && topics.length > 0) {
          topics.forEach((topic) => {
            if (!pattern.topics.includes(topic)) {
              pattern.topics.push(topic);
            }
          });
        }

        await pattern.save();
      } else {
        // Create new pattern
        pattern = new this.learningPatternModel({
          pattern: normalizedPattern,
          originalQuery: userMessage,
          variations: [userMessage.toLowerCase()],
          category: category || 'General',
          topics: topics || [],
          keywords,
          successfulResponses: [assistantResponse],
          frequency: 1,
          firstSeen: new Date(),
          lastSeen: new Date(),
        });

        await pattern.save();
      }

      this.logger.debug(`Learned from message: ${normalizedPattern}`);
    } catch (error) {
      this.logger.error('Error learning from message', error);
    }
  }

  async getSimilarPatterns(
    query: string,
    limit: number = 5,
  ): Promise<LearningPattern[]> {
    try {
      const normalizedQuery = this.normalizeQuery(query);
      const keywords = this.extractKeywords(query);

      // Find patterns with similar keywords or matching category
      const patterns = await this.learningPatternModel
        .find({
          $or: [
            { pattern: { $regex: normalizedQuery, $options: 'i' } },
            { keywords: { $in: keywords } },
            { variations: { $regex: normalizedQuery, $options: 'i' } },
          ],
        })
        .sort({ frequency: -1, lastSeen: -1 })
        .limit(limit)
        .exec();

      return patterns;
    } catch (error) {
      this.logger.error('Error getting similar patterns', error);
      return [];
    }
  }

  async getPopularPatterns(limit: number = 10): Promise<LearningPattern[]> {
    try {
      return await this.learningPatternModel
        .find()
        .sort({ frequency: -1, lastSeen: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      this.logger.error('Error getting popular patterns', error);
      return [];
    }
  }

  async getPatternsByCategory(
    category: string,
    limit: number = 10,
  ): Promise<LearningPattern[]> {
    try {
      return await this.learningPatternModel
        .find({ category })
        .sort({ frequency: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      this.logger.error('Error getting patterns by category', error);
      return [];
    }
  }

  async getLearningInsights(): Promise<{
    totalPatterns: number;
    totalConversations: number;
    popularCategories: Array<{ category: string; count: number }>;
    trendingTopics: Array<{ topic: string; count: number }>;
  }> {
    try {
      const totalPatterns = await this.learningPatternModel.countDocuments();
      const totalConversations = await this.conversationModel.countDocuments();

      // Get popular categories
      const categoryStats = await this.learningPatternModel.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      // Get trending topics
      const topicStats = await this.learningPatternModel.aggregate([
        { $unwind: '$topics' },
        { $group: { _id: '$topics', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      return {
        totalPatterns,
        totalConversations,
        popularCategories: categoryStats.map((s) => ({
          category: s._id,
          count: s.count,
        })),
        trendingTopics: topicStats.map((s) => ({
          topic: s._id,
          count: s.count,
        })),
      };
    } catch (error) {
      this.logger.error('Error getting learning insights', error);
      return {
        totalPatterns: 0,
        totalConversations: 0,
        popularCategories: [],
        trendingTopics: [],
      };
    }
  }

  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  private extractKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .filter((word) => !this.isStopWord(word));

    // Return unique keywords
    return [...new Set(words)];
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'the',
      'is',
      'at',
      'which',
      'on',
      'a',
      'an',
      'as',
      'are',
      'was',
      'were',
      'been',
      'be',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'may',
      'might',
      'must',
      'can',
      'this',
      'that',
      'these',
      'those',
      'i',
      'you',
      'he',
      'she',
      'it',
      'we',
      'they',
      'what',
      'where',
      'when',
      'why',
      'how',
      'who',
      'whom',
      'whose',
      'which',
      'where',
    ];
    return stopWords.includes(word);
  }
}
