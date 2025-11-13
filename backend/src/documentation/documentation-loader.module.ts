import { Module } from '@nestjs/common';
import { DocumentationLoaderService } from './documentation-loader.service';

@Module({
  providers: [DocumentationLoaderService],
  exports: [DocumentationLoaderService],
})
export class DocumentationLoaderModule {}
