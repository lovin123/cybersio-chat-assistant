import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KnowledgeBaseDocument = KnowledgeBase & Document;

@Schema({ timestamps: true })
export class KnowledgeBase {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ type: [String], default: [], index: true })
  keywords: string[];

  @Prop({ type: String })
  markdown?: string;

  @Prop({ type: [Number], default: [] })
  embedding?: number[]; // Vector embedding for semantic search

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const KnowledgeBaseSchema = SchemaFactory.createForClass(KnowledgeBase);

// Indexes for better search performance
KnowledgeBaseSchema.index({ title: 'text', content: 'text', keywords: 'text' });
KnowledgeBaseSchema.index({ category: 1 });
KnowledgeBaseSchema.index({ usageCount: -1 });
