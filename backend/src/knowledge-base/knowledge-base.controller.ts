import {
  Controller,
  Post,
  Body,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { AddDocumentationDto } from './dto/add-documentation.dto';

@Controller('api/knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Post('add')
  async addDocumentation(@Body() dto: AddDocumentationDto) {
    try {
      await this.knowledgeBaseService.addDocumentation({
        id: Date.now().toString(),
        title: dto.title,
        content: dto.content,
        category: dto.category,
        keywords: dto.keywords || [],
      });
      return {
        success: true,
        message: 'Documentation added successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to add documentation',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  async getAllDocumentation() {
    try {
      const docs = this.knowledgeBaseService.getAllDocumentation();
      return {
        success: true,
        data: docs,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve documentation',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
