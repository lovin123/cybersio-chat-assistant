import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { KnowledgeBase, KnowledgeBaseSchema } from './schemas/knowledge-base.schema';
import { LearningPattern, LearningPatternSchema } from './schemas/learning-patterns.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/cybersio-chat',
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: KnowledgeBase.name, schema: KnowledgeBaseSchema },
      { name: LearningPattern.name, schema: LearningPatternSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}

