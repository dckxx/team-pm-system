import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
