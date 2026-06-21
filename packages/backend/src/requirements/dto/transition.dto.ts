import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class TransitionDto {
  @IsString()
  @IsNotEmpty()
  toStatus!: string;

  @IsInt()
  @Min(0)
  version!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
