import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { HuggingFaceAiService } from './huggingface-ai.service';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';

@Module({
  imports: [KnowledgeBaseModule],
  providers: [AiService, HuggingFaceAiService],
  exports: [AiService],
})
export class AiModule {}
