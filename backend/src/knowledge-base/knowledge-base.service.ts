import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  KnowledgeBase,
  KnowledgeBaseDocument,
} from '../database/schemas/knowledge-base.schema';
import { DocumentationLoaderService } from '../documentation/documentation-loader.service';
import { RagService } from '../rag/rag.service';

export interface DocumentationChunk {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
}

@Injectable()
export class KnowledgeBaseService implements OnModuleInit {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(
    @InjectModel(KnowledgeBase.name)
    private knowledgeBaseModel: Model<KnowledgeBaseDocument>,
    private readonly documentationLoader: DocumentationLoaderService,
    private readonly ragService: RagService,
  ) {}

  async onModuleInit() {
    await this.loadDocumentation();
  }

  async loadDocumentation(): Promise<void> {
    try {
      // Check if we already have documentation in MongoDB
      const existingCount = await this.knowledgeBaseModel.countDocuments();

      if (existingCount === 0) {
        // Load from markdown file and save to MongoDB
        const markdownSections =
          await this.documentationLoader.loadMarkdownDocumentation(
            'api-documentation.md',
          );

        if (markdownSections.length > 0) {
          const docsToSave = markdownSections.map((section) => ({
            title: section.title,
            content: section.content,
            category: section.category,
            keywords: section.keywords,
            markdown: section.markdown,
          }));

          await this.knowledgeBaseModel.insertMany(docsToSave);
          this.logger.log(
            `Loaded ${docsToSave.length} sections from markdown documentation into MongoDB`,
          );

          // Generate embeddings for new documents in background
          this.ragService.generateEmbeddingsInBackground().catch((err) => {
            this.logger.warn('Background embedding generation failed', err);
          });
        } else {
          // Create default documentation
          await this.createDefaultDocumentation();
        }
      } else {
        this.logger.log(
          `Found ${existingCount} existing documentation entries in MongoDB`,
        );

        // Generate embeddings for documents without embeddings
        this.ragService.generateEmbeddingsInBackground().catch((err) => {
          this.logger.warn('Background embedding generation failed', err);
        });
      }
    } catch (error) {
      this.logger.error('Error loading documentation', error);
      await this.createDefaultDocumentation();
    }
  }

  async addDocumentation(chunk: DocumentationChunk): Promise<void> {
    const doc = new this.knowledgeBaseModel({
      title: chunk.title,
      content: chunk.content,
      category: chunk.category,
      keywords: chunk.keywords,
    });

    await doc.save();

    // Generate embedding for new document
    const textToEmbed = `${chunk.title} ${chunk.content}`.trim();
    const embedding = await this.ragService.generateEmbedding(textToEmbed);
    if (embedding.length > 0) {
      doc.embedding = embedding;
      await doc.save();
    }

    this.logger.log(`Added documentation: ${chunk.title}`);
  }

  async addBulkDocumentation(chunks: DocumentationChunk[]): Promise<void> {
    const docsToSave = chunks.map((chunk) => ({
      title: chunk.title,
      content: chunk.content,
      category: chunk.category,
      keywords: chunk.keywords,
    }));

    await this.knowledgeBaseModel.insertMany(docsToSave);
    this.logger.log(`Added ${docsToSave.length} documentation chunks`);
  }

  /**
   * Enhanced RAG-based search using semantic similarity
   */
  async searchRelevantContext(
    query: string,
    limit: number = 5,
  ): Promise<string> {
    try {
      // Use hybrid search (semantic + keyword) for best results
      const { documents, scores } = await this.ragService.hybridSearch(
        query,
        limit,
      );

      if (documents.length === 0) {
        return '';
      }

      // Format context for AI prompt
      return this.ragService.formatContextForPrompt(documents, scores);
    } catch (error) {
      this.logger.error('Error in RAG search', error);
      // Fallback to basic keyword search
      return await this.fallbackKeywordSearch(query, limit);
    }
  }

  /**
   * Fallback keyword search
   */
  private async fallbackKeywordSearch(
    query: string,
    limit: number,
  ): Promise<string> {
    const normalizedQuery = query.toLowerCase();
    const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 2);

    try {
      const results = await this.knowledgeBaseModel
        .find({
          $or: [
            { keywords: { $in: queryWords } },
            { title: { $regex: normalizedQuery, $options: 'i' } },
            { content: { $regex: normalizedQuery, $options: 'i' } },
          ],
        })
        .sort({ usageCount: -1 })
        .limit(limit)
        .exec();

      if (results.length === 0) {
        return '';
      }

      return results
        .map((doc) => `[${doc.category}] ${doc.title}\n${doc.content}`)
        .join('\n\n---\n\n');
    } catch (error) {
      this.logger.error('Error in fallback keyword search', error);
      return '';
    }
  }

  async getAllDocumentation(): Promise<KnowledgeBaseDocument[]> {
    return await this.knowledgeBaseModel.find().sort({ usageCount: -1 }).exec();
  }

  async clearDocumentation(): Promise<void> {
    await this.knowledgeBaseModel.deleteMany({});
    this.logger.log('Cleared all documentation');
  }

  private async createDefaultDocumentation(): Promise<void> {
    const defaultDocs = [
      {
        title: 'Dashboard Navigation',
        content:
          'Dashboards in CyberSIO provide visual overviews of security metrics. Navigate to Dashboards from the main menu. Use filters to customize time ranges and data sources. Click widgets to drill down into details.',
        category: 'UI Navigation',
        keywords: ['dashboard', 'view', 'overview', 'metrics', 'widgets'],
      },
      {
        title: 'Alert Management',
        content:
          'Alerts section shows security events requiring attention. Access from main navigation. View alert details by clicking on an alert. Actions available: acknowledge, resolve, assign, escalate. Use filters to find specific alerts.',
        category: 'Alerts',
        keywords: [
          'alert',
          'alerts',
          'notification',
          'security event',
          'incident',
        ],
      },
      {
        title: 'Anomaly Detection',
        content:
          'Anomalies are detected by tbUEBA through behavioral analysis. Navigate to Anomalies section in tbUEBA module. Review anomaly scores and timelines. Click anomalies to investigate user or entity behavior patterns.',
        category: 'Anomalies',
        keywords: [
          'anomaly',
          'anomalies',
          'behavior',
          'tbueba',
          'unusual activity',
        ],
      },
      {
        title: 'Detection Rules',
        content:
          'Rules define security detection logic. Access from Rules or Detection Rules menu. Create new rules or edit existing ones. Test rules before enabling. Monitor rule performance from the rules dashboard.',
        category: 'Rules',
        keywords: [
          'rule',
          'rules',
          'detection',
          'security rule',
          'correlation',
        ],
      },
      {
        title: 'Investigations',
        content:
          'Investigations help track security cases. Create new investigations from Investigations section. Add evidence, notes, and findings. Link related alerts and anomalies. Assign team members and track status.',
        category: 'Investigations',
        keywords: ['investigation', 'case', 'evidence', 'findings', 'track'],
      },
      {
        title: 'Report Generation',
        content:
          'Reports provide summarized security insights. Access Reports from main menu. Select templates or create custom reports. Configure time ranges and filters. Preview before generating. Schedule automatic delivery.',
        category: 'Reports',
        keywords: ['report', 'reports', 'generate', 'template', 'schedule'],
      },
      {
        title: 'tbSIEM Overview',
        content:
          'tbSIEM (Threat-Based SIEM) handles log collection, threat detection, incident management, and compliance reporting. Access from main menu. Key features include log analysis, threat correlation, and incident response workflows.',
        category: 'tbSIEM',
        keywords: [
          'tbsiem',
          'siem',
          'logs',
          'threat',
          'incident',
          'compliance',
        ],
      },
      {
        title: 'tbUEBA Overview',
        content:
          'tbUEBA (Threat-Based UEBA) analyzes user and entity behaviors. Features include behavior profiling, anomaly detection, risk scoring, and entity timeline analysis. Access from main menu to view behavioral insights.',
        category: 'tbUEBA',
        keywords: [
          'tbueba',
          'ueba',
          'behavior',
          'user',
          'entity',
          'risk score',
        ],
      },
    ];

    await this.knowledgeBaseModel.insertMany(defaultDocs);
    this.logger.log('Created default documentation in MongoDB');
  }
}
