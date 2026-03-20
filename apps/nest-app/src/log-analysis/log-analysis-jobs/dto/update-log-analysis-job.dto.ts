import { IsOptional, IsString } from 'class-validator';

export class UpdateLogAnalysisJobDto {
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
