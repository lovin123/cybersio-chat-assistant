import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async sendMessage(
    @Body() chatMessageDto: ChatMessageDto,
    @Query('sessionId') sessionId?: string,
  ) {
    try {
      const result = await this.chatService.processMessage(
        chatMessageDto.message,
        sessionId,
      );
      return {
        success: true,
        response: result.response,
        sessionId: result.sessionId,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to process message. Please try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
