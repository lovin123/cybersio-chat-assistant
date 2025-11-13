import { Module } from '@nestjs/common';
import { ConversationHistoryService } from './conversation-history.service';
import { ConversationHistoryController } from './conversation-history.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ConversationHistoryService],
  controllers: [ConversationHistoryController],
  exports: [ConversationHistoryService],
})
export class ConversationHistoryModule {}
