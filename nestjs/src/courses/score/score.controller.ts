import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CacheInterceptor,
  CacheTTL,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { CourseGuard, DefaultGuard } from 'src/auth';
import { DEFAULT_CACHE_TTL } from 'src/constants';

import { ScoreQueryDto, OrderDirection, OrderField } from './dto/score-query.dto';
import { ScoreService } from './score.service';
import { ScoreDto } from './dto/score.dto';

@Controller('course/:courseId/students/score')
@ApiTags('students score')
export class ScoreController {
  constructor(private scoreService: ScoreService) {}

  @Get('/')
  @UseGuards(DefaultGuard, CourseGuard)
  @ApiOperation({ operationId: 'getScore' })
  @ApiOkResponse({ type: ScoreDto })
  @CacheTTL(DEFAULT_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  public async getScore(@Query() query: ScoreQueryDto, @Param('courseId', ParseIntPipe) courseId: number) {
    const queryCopy = Object.fromEntries(Object.entries(query).map(([key, value]) => [key, value.trim()]));
    const orderBy: OrderField = queryCopy.orderBy ?? 'totalScore';
    const orderDirection: OrderDirection = (queryCopy.orderDirection?.toUpperCase() as OrderDirection) ?? 'DESC';
    const page = parseInt(queryCopy.current);
    const limit = parseInt(queryCopy.pageSize);

    const score = await this.scoreService.getScore({
      courseId,
      filter: queryCopy,
      orderBy: { field: orderBy, direction: orderDirection },
      page,
      limit,
    });

    return score;
  }
}
