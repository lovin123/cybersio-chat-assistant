import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LearningPatternDocument = LearningPattern & Document;

@Schema({ timestamps: true })
export class LearningPattern {
  @Prop({ required: true, unique: true, index: true })
  pattern: string; // Normalized question/query pattern

  @Prop({ required: true })
  originalQuery: string;

  @Prop({ type: [String], default: [] })
  variations: string[]; // Similar queries

  @Prop({ required: true })
  category: string;

  @Prop({ type: [String], default: [] })
  topics: string[];

  @Prop({ default: 1 })
  frequency: number; // How many times this pattern appears

  @Prop({ type: [String], default: [] })
  successfulResponses: string[]; // Responses that worked well

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ default: 0 })
  averageResponseTime: number;

  @Prop({ default: 0 })
  userSatisfactionScore: number; // Can be updated based on feedback

  @Prop({ default: Date.now })
  firstSeen: Date;

  @Prop({ default: Date.now })
  lastSeen: Date;
}

export const LearningPatternSchema =
  SchemaFactory.createForClass(LearningPattern);

// Indexes
LearningPatternSchema.index({ pattern: 1 });
LearningPatternSchema.index({ category: 1, frequency: -1 });
LearningPatternSchema.index({ frequency: -1 });
LearningPatternSchema.index({ lastSeen: -1 });
