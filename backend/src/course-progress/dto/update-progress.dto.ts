import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  @IsNotEmpty()
  sectionSlug: string;

  @IsString()
  @IsNotEmpty()
  classSlug: string;

  @IsInt()
  @Min(0)
  positionSeconds: number;

  @IsInt()
  @IsPositive()
  durationSeconds: number;
}
