import { Module } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { DocumentationLoaderModule } from '../documentation/documentation-loader.module';
import { DatabaseModule } from '../database/database.module';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [DocumentationLoaderModule, DatabaseModule, RagModule],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
