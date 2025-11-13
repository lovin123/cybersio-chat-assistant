import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs-extra';
import { join } from 'path';

interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  markdown: string;
}

@Injectable()
export class DocumentationLoaderService {
  private readonly logger = new Logger(DocumentationLoaderService.name);
  private readonly docsPath: string;

  constructor() {
    this.docsPath = join(process.cwd(), 'data');
  }

  async loadMarkdownDocumentation(
    filename: string = 'api-documentation.md',
  ): Promise<DocumentationSection[]> {
    try {
      const filePath = join(this.docsPath, filename);

      if (!(await fs.pathExists(filePath))) {
        this.logger.warn(`Documentation file not found: ${filePath}`);
        return [];
      }

      const fileContent = await fs.readFile(filePath, 'utf-8');
      const sections = this.parseMarkdownSections(fileContent);

      this.logger.log(`Loaded ${sections.length} sections from ${filename}`);
      return sections;
    } catch (error) {
      this.logger.error('Error loading markdown documentation', error);
      return [];
    }
  }

  private parseMarkdownSections(content: string): DocumentationSection[] {
    const sections: DocumentationSection[] = [];
    const lines = content.split('\n');

    let currentSection: Partial<DocumentationSection> | null = null;
    let currentContent: string[] = [];
    let currentMarkdown: string[] = [];
    let sectionCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for heading (## or ###)
      if (line.startsWith('##')) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          sections.push({
            id: currentSection.id || `section-${sectionCounter}`,
            title: currentSection.title || 'Untitled',
            content: currentContent.join('\n').trim(),
            category: currentSection.category || 'General',
            keywords: currentSection.keywords || [],
            markdown: currentMarkdown.join('\n').trim(),
          });
          sectionCounter++;
        }

        // Start new section
        const headingLevel = line.match(/^#+/)?.[0].length || 0;
        const title = line.replace(/^#+\s*/, '').trim();

        // Determine category from heading hierarchy
        const category = this.extractCategory(title, headingLevel);
        const keywords = this.extractKeywords(title);

        currentSection = {
          id: `section-${sectionCounter}`,
          title,
          category,
          keywords,
        };
        currentContent = [];
        currentMarkdown = [line];
      } else {
        // Add to current section
        if (currentSection) {
          currentMarkdown.push(line);

          // Extract plain text content (remove markdown formatting)
          const plainText = this.stripMarkdown(line);
          if (plainText.trim()) {
            currentContent.push(plainText);
          }
        }
      }
    }

    // Save last section
    if (currentSection && currentContent.length > 0) {
      sections.push({
        id: currentSection.id || `section-${sectionCounter}`,
        title: currentSection.title || 'Untitled',
        content: currentContent.join('\n').trim(),
        category: currentSection.category || 'General',
        keywords: currentSection.keywords || [],
        markdown: currentMarkdown.join('\n').trim(),
      });
    }

    return sections;
  }

  private extractCategory(title: string, level: number): string {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('tbsiem') || titleLower.includes('siem')) {
      return 'tbSIEM';
    }
    if (titleLower.includes('tbueba') || titleLower.includes('ueba')) {
      return 'tbUEBA';
    }
    if (titleLower.includes('dashboard')) {
      return 'Dashboards';
    }
    if (titleLower.includes('alert')) {
      return 'Alerts';
    }
    if (titleLower.includes('anomaly')) {
      return 'Anomalies';
    }
    if (titleLower.includes('rule')) {
      return 'Rules';
    }
    if (titleLower.includes('investigation')) {
      return 'Investigations';
    }
    if (titleLower.includes('report')) {
      return 'Reports';
    }
    if (titleLower.includes('navigation') || titleLower.includes('ui')) {
      return 'UI Navigation';
    }

    return 'General';
  }

  private extractKeywords(title: string): string[] {
    const keywords: string[] = [];
    const titleLower = title.toLowerCase();

    // Extract key terms
    const terms = [
      'dashboard',
      'alert',
      'anomaly',
      'rule',
      'investigation',
      'report',
      'tbsiem',
      'tbueba',
      'siem',
      'ueba',
      'user',
      'entity',
      'threat',
      'security',
      'compliance',
      'log',
      'incident',
      'timeline',
      'risk',
      'behavior',
      'detection',
      'navigation',
      'ui',
      'workflow',
    ];

    terms.forEach((term) => {
      if (titleLower.includes(term)) {
        keywords.push(term);
      }
    });

    // Add title words as keywords
    const words = title.split(/\s+/).filter((w) => w.length > 3);
    keywords.push(...words.map((w) => w.toLowerCase()));

    return [...new Set(keywords)];
  }

  private stripMarkdown(text: string): string {
    // Remove markdown links but keep text
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    // Remove markdown formatting
    text = text.replace(/\*\*([^\*]+)\*\*/g, '$1');
    text = text.replace(/\*([^\*]+)\*/g, '$1');
    text = text.replace(/`([^`]+)`/g, '$1');
    text = text.replace(/^#+\s*/g, '');
    text = text.replace(/^[-*+]\s*/g, '');
    text = text.replace(/^\d+\.\s*/g, '');
    return text.trim();
  }

  async getFullDocumentation(): Promise<string> {
    try {
      const filePath = join(this.docsPath, 'api-documentation.md');
      if (await fs.pathExists(filePath)) {
        return await fs.readFile(filePath, 'utf-8');
      }
      return '';
    } catch (error) {
      this.logger.error('Error reading full documentation', error);
      return '';
    }
  }
}
