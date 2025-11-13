import { Controller, Get, Query } from '@nestjs/common';
import { LearningService } from './learning.service';

@Controller('api/learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get('insights')
  async getInsights() {
    const insights = await this.learningService.getLearningInsights();
    return {
      success: true,
      data: insights,
    };
  }

  @Get('popular-patterns')
  async getPopularPatterns(@Query('limit') limit?: string) {
    const patterns = await this.learningService.getPopularPatterns(
      limit ? parseInt(limit, 10) : 10,
    );
    return {
      success: true,
      data: patterns,
    };
  }

  @Get('patterns-by-category')
  async getPatternsByCategory(
    @Query('category') category: string,
    @Query('limit') limit?: string,
  ) {
    const patterns = await this.learningService.getPatternsByCategory(
      category,
      limit ? parseInt(limit, 10) : 10,
    );
    return {
      success: true,
      data: patterns,
    };
  }
}
