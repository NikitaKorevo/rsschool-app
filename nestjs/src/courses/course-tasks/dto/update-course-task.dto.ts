import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { typeEnum } from './course-task.dto';

export class UpdateCourseTaskDto {
  @IsOptional()
  @ApiProperty({ enum: typeEnum, required: false })
  type?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  name?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  checker?: string;

  @ApiProperty()
  studentStartDate: string;

  @ApiProperty()
  studentEndDate: string;

  @IsOptional()
  @ApiProperty({ required: false })
  descriptionUrl: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  taskOwnerId?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  maxScore?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  scoreWeight?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pairsCount?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  taskId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  special?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  crossCheckEndDate?: string;
}
