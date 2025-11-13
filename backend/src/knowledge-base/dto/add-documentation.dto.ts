import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class AddDocumentationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}
