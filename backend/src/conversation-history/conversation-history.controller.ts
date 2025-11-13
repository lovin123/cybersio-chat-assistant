import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ConversationHistoryService } from './conversation-history.service';

@Controller('api/conversation-history')
export class ConversationHistoryController {
  constructor(
    private readonly conversationHistoryService: ConversationHistoryService,
  ) {}

  @Post('sessions')
  async createSession(@Body() body: { userId?: string }) {
    const sessionId = await this.conversationHistoryService.createSession(
      body.userId,
    );
    return {
      success: true,
      sessionId,
    };
  }

  @Get('sessions/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    const session = await this.conversationHistoryService.getSession(sessionId);
    if (!session) {
      return {
        success: false,
        message: 'Session not found',
      };
    }
    return {
      success: true,
      data: session,
    };
  }

  @Get('sessions')
  async getAllSessions(@Query('userId') userId?: string) {
    const sessions =
      await this.conversationHistoryService.getAllSessions(userId);
    return {
      success: true,
      data: sessions,
    };
  }

  @Get('sessions/:sessionId/messages')
  async getMessages(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: string,
  ) {
    const messages = await this.conversationHistoryService.getRecentMessages(
      sessionId,
      limit ? parseInt(limit, 10) : 10,
    );
    return {
      success: true,
      data: messages,
    };
  }

  @Delete('sessions/:sessionId')
  async deleteSession(@Param('sessionId') sessionId: string) {
    await this.conversationHistoryService.deleteSession(sessionId);
    return {
      success: true,
      message: 'Session deleted',
    };
  }

  @Get('analytics/popular-topics')
  async getPopularTopics(@Query('limit') limit?: string) {
    const topics = await this.conversationHistoryService.getPopularTopics(
      limit ? parseInt(limit, 10) : 10,
    );
    return {
      success: true,
      data: topics,
    };
  }

  @Get('analytics/common-questions')
  async getCommonQuestions(@Query('limit') limit?: string) {
    const questions = await this.conversationHistoryService.getCommonQuestions(
      limit ? parseInt(limit, 10) : 10,
    );
    return {
      success: true,
      data: questions,
    };
  }
}
