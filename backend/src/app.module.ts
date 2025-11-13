import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { ConversationHistoryModule } from './conversation-history/conversation-history.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ChatModule,
    ConversationHistoryModule,
  ],
})
export class AppModule {}
