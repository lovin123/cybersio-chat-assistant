import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AiModule } from '../ai/ai.module';
import { ConversationHistoryModule } from '../conversation-history/conversation-history.module';
import { LearningModule } from '../learning/learning.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';

@Module({
  imports: [
    AiModule,
    KnowledgeBaseModule,
    ConversationHistoryModule,
    LearningModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
