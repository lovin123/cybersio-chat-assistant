import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  KnowledgeBase,
  KnowledgeBaseDocument,
} from '../database/schemas/knowledge-base.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private embeddingPipeline: any = null;
  private readonly embeddingModel = 'Xenova/all-MiniLM-L6-v2'; // Lightweight embedding model

  constructor(
    @InjectModel(KnowledgeBase.name)
    private knowledgeBaseModel: Model<KnowledgeBaseDocument>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      // Lazy load embeddings - only load when needed
      this.logger.log(
        'RAG Service initialized. Embeddings will be loaded on first use.',
      );
    } catch (error) {
      this.logger.warn(
        'Could not initialize embedding model. Using keyword-based search fallback.',
        error,
      );
    }
  }

  /**
   * Generate embedding vector for text using Hugging Face transformers
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Lazy load the embedding pipeline
      if (!this.embeddingPipeline) {
        const { pipeline } = await import('@xenova/transformers');
        this.embeddingPipeline = await pipeline(
          'feature-extraction',
          this.embeddingModel,
        );
        this.logger.log('Embedding model loaded successfully');
      }

      const output = await this.embeddingPipeline(text, {
        pooling: 'mean',
        normalize: true,
      });

      // Convert tensor to array
      const embedding = Array.from(output.data);
      return embedding as unknown as number[];
    } catch (error) {
      this.logger.error('Error generating embedding', error);
      // Return empty embedding as fallback
      return [];
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) {
      return 0;
    }

    return dotProduct / denominator;
  }

  /**
   * Enhanced RAG retrieval with semantic search using vector embeddings
   */
  async retrieveRelevantContext(
    query: string,
    limit: number = 5,
    minSimilarity: number = 0.3,
  ): Promise<{ documents: KnowledgeBaseDocument[]; scores: number[] }> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      if (queryEmbedding.length === 0) {
        // Fallback to keyword-based search if embeddings fail
        this.logger.warn(
          'Embedding generation failed, using keyword-based search',
        );
        return await this.keywordBasedSearch(query, limit);
      }

      // Get all documents with embeddings
      const allDocs = await this.knowledgeBaseModel
        .find({ embedding: { $exists: true, $ne: [] } })
        .exec();

      if (allDocs.length === 0) {
        // No embeddings yet, use keyword search and generate embeddings in background
        this.logger.warn('No embeddings found, using keyword search');
        const result = await this.keywordBasedSearch(query, limit);
        // Generate embeddings in background for future use
        this.generateEmbeddingsInBackground();
        return result;
      }

      // Calculate similarity scores
      const scoredDocs = allDocs
        .map((doc) => {
          if (!doc.embedding || doc.embedding.length === 0) {
            return { doc, score: 0 };
          }
          const similarity = this.cosineSimilarity(
            queryEmbedding,
            doc.embedding,
          );
          return { doc, score: similarity };
        })
        .filter((item) => item.score >= minSimilarity)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      const documents = scoredDocs.map((item) => item.doc);
      const scores = scoredDocs.map((item) => item.score);

      // Increment usage count
      if (documents.length > 0) {
        const ids = documents.map((d) => d._id);
        await this.knowledgeBaseModel.updateMany(
          { _id: { $in: ids } },
          { $inc: { usageCount: 1 } },
        );
      }

      this.logger.debug(
        `Retrieved ${documents.length} documents with semantic search (min similarity: ${minSimilarity})`,
      );

      return { documents, scores };
    } catch (error) {
      this.logger.error('Error in semantic retrieval', error);
      // Fallback to keyword search
      return await this.keywordBasedSearch(query, limit);
    }
  }

  /**
   * Fallback keyword-based search
   */
  private async keywordBasedSearch(
    query: string,
    limit: number,
  ): Promise<{ documents: KnowledgeBaseDocument[]; scores: number[] }> {
    const normalizedQuery = query.toLowerCase();
    const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 2);

    try {
      // Try text search first (if text index exists)
      let results: any[] = [];
      let useTextSearch = false;

      try {
        results = await this.knowledgeBaseModel
          .find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } },
          )
          .sort({ score: { $meta: 'textScore' }, usageCount: -1 })
          .limit(limit)
          .exec();
        useTextSearch = results.length > 0;
      } catch (textError) {
        // Text index might not exist or query failed, continue with regex search
        this.logger.debug('Text search not available, using regex search');
      }

      // If text search didn't return results or failed, use regex/keyword search
      if (!useTextSearch || results.length < limit) {
        const regexResults = await this.knowledgeBaseModel
          .find({
            $or: [
              { keywords: { $in: queryWords } },
              { title: { $regex: normalizedQuery, $options: 'i' } },
              { content: { $regex: normalizedQuery, $options: 'i' } },
            ],
          })
          .sort({ usageCount: -1, createdAt: -1 })
          .limit(limit)
          .exec();

        // Merge results, avoiding duplicates
        const existingIds = new Set(results.map((r) => r._id.toString()));
        const newResults = regexResults.filter(
          (r) => !existingIds.has(r._id.toString()),
        );
        results = [...results, ...newResults].slice(0, limit);
      }

      // Assign scores (0.5 for regex results, textScore for text search results)
      const scores = results.map((doc: any) => doc.score || 0.5);

      return { documents: results, scores };
    } catch (error) {
      this.logger.error('Error in keyword search', error);
      return { documents: [], scores: [] };
    }
  }

  /**
   * Generate embeddings for all documents without embeddings
   */
  async generateEmbeddingsInBackground(): Promise<void> {
    try {
      const docsWithoutEmbeddings = await this.knowledgeBaseModel
        .find({
          $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
        })
        .limit(10) // Process in batches
        .exec();

      if (docsWithoutEmbeddings.length === 0) {
        return;
      }

      this.logger.log(
        `Generating embeddings for ${docsWithoutEmbeddings.length} documents`,
      );

      for (const doc of docsWithoutEmbeddings) {
        try {
          const textToEmbed = `${doc.title} ${doc.content}`.trim();
          const embedding = await this.generateEmbedding(textToEmbed);

          if (embedding.length > 0) {
            doc.embedding = embedding;
            await doc.save();
            this.logger.debug(`Generated embedding for: ${doc.title}`);
          }
        } catch (error) {
          this.logger.warn(
            `Failed to generate embedding for ${doc.title}`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error generating embeddings in background', error);
    }
  }

  /**
   * Chunk large documents for better retrieval
   */
  chunkDocument(
    content: string,
    chunkSize: number = 500,
    overlap: number = 50,
  ): string[] {
    const chunks: string[] = [];
    const words = content.split(/\s+/);

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim());
      }
    }

    return chunks;
  }

  /**
   * Format retrieved context for AI prompt
   */
  formatContextForPrompt(
    documents: KnowledgeBaseDocument[],
    scores?: number[],
  ): string {
    if (documents.length === 0) {
      return '';
    }

    return documents
      .map((doc, index) => {
        let context = `[${doc.category}] ${doc.title}`;
        if (scores && scores[index] !== undefined) {
          context += ` (relevance: ${(scores[index] * 100).toFixed(1)}%)`;
        }
        context += `\n${doc.content}`;
        return context;
      })
      .join('\n\n---\n\n');
  }

  /**
   * Hybrid search: combines semantic and keyword search
   */
  async hybridSearch(
    query: string,
    limit: number = 5,
  ): Promise<{ documents: KnowledgeBaseDocument[]; scores: number[] }> {
    try {
      // Get semantic results
      const semanticResults = await this.retrieveRelevantContext(
        query,
        limit * 2,
        0.2,
      );

      // Get keyword results
      const keywordResults = await this.keywordBasedSearch(query, limit * 2);

      // Combine and deduplicate
      const docMap = new Map<
        string,
        { doc: KnowledgeBaseDocument; score: number }
      >();

      // Add semantic results with higher weight
      semanticResults.documents.forEach((doc, index) => {
        const id = doc._id.toString();
        const existing = docMap.get(id);
        const semanticScore = semanticResults.scores[index] || 0;

        if (!existing || existing.score < semanticScore) {
          docMap.set(id, { doc, score: semanticScore * 1.2 }); // Boost semantic scores
        }
      });

      // Add keyword results
      keywordResults.documents.forEach((doc, index) => {
        const id = doc._id.toString();
        const existing = docMap.get(id);
        const keywordScore = keywordResults.scores[index] || 0.5;

        if (!existing) {
          docMap.set(id, { doc, score: keywordScore });
        } else {
          // Combine scores
          existing.score = (existing.score + keywordScore) / 2;
        }
      });

      // Sort by combined score and return top results
      const combined = Array.from(docMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return {
        documents: combined.map((item) => item.doc),
        scores: combined.map((item) => item.score),
      };
    } catch (error) {
      this.logger.error('Error in hybrid search', error);
      return await this.keywordBasedSearch(query, limit);
    }
  }
}
