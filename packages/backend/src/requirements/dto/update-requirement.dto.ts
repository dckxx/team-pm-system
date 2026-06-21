import {
  IsString,
  IsOptional,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsInt,
  Min,
} from 'class-validator';

class DeveloperAssignmentDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsIn(['frontend', 'backend', 'data'])
  role!: string;
}

export class UpdateRequirementDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['P0', 'P1', 'P2', 'P3'])
  priority?: string;

  @IsOptional()
  @IsString()
  plannedLaunch?: string;

  @IsOptional()
  @IsString()
  plannedOnline?: string;

  @IsOptional()
  @IsString()
  actualDevStart?: string;

  @IsOptional()
  @IsString()
  actualDevEnd?: string;

  @IsOptional()
  @IsString()
  actualTestStart?: string;

  @IsOptional()
  @IsString()
  actualTestEnd?: string;

  @IsOptional()
  @IsString()
  actualOnline?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  developerIds?: DeveloperAssignmentDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  version?: number;
}
