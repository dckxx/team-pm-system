import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';

class DeveloperAssignmentDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsIn(['frontend', 'backend', 'data'])
  role!: string;
}

export class CreateRequirementDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  projectId!: string;

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
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  developerIds?: DeveloperAssignmentDto[];
}
