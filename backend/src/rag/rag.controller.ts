import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('api/rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('generate-embeddings')
  async generateEmbeddings() {
    try {
      await this.ragService.generateEmbeddingsInBackground();
      return {
        success: true,
        message: 'Embedding generation started in background',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate embeddings',
        error: error.message,
      };
    }
  }

  @Get('search')
  async search(
    @Query('query') query: string,
    @Query('limit') limit?: string,
    @Query('minSimilarity') minSimilarity?: string,
  ) {
    try {
      const { documents, scores } =
        await this.ragService.retrieveRelevantContext(
          query,
          limit ? parseInt(limit, 10) : 5,
          minSimilarity ? parseFloat(minSimilarity) : 0.3,
        );

      return {
        success: true,
        data: {
          documents: documents.map((doc, index) => ({
            title: doc.title,
            content: doc.content,
            category: doc.category,
            score: scores[index],
          })),
          count: documents.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Search failed',
        error: error.message,
      };
    }
  }

  @Get('hybrid-search')
  async hybridSearch(
    @Query('query') query: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const { documents, scores } = await this.ragService.hybridSearch(
        query,
        limit ? parseInt(limit, 10) : 5,
      );

      return {
        success: true,
        data: {
          documents: documents.map((doc, index) => ({
            title: doc.title,
            content: doc.content,
            category: doc.category,
            score: scores[index],
          })),
          count: documents.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Hybrid search failed',
        error: error.message,
      };
    }
  }
}
