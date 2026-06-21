import { IsOptional, IsString, IsBoolean, IsEmail, IsArray, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsIn(['pm', 'dev'])
  role?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(['frontend', 'backend', 'data'], { each: true })
  devRoles?: string[];

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
