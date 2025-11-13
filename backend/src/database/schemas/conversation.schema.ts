import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, unique: true, index: true })
  sessionId: string;

  @Prop({ index: true })
  userId?: string;

  @Prop({
    type: [{ role: String, content: String, timestamp: Date }],
    default: [],
  })
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;

  @Prop({ type: Object })
  metadata?: {
    topic?: string;
    category?: string;
    tags?: string[];
    summary?: string;
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Indexes for better query performance
ConversationSchema.index({ userId: 1, createdAt: -1 });
ConversationSchema.index({ 'metadata.topic': 1 });
ConversationSchema.index({ 'metadata.category': 1 });
ConversationSchema.index({ updatedAt: -1 });
