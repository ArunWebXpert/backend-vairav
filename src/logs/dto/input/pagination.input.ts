import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@constants/general.constants';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationInput {
  @IsNumber()
  @IsOptional()
  page: number = DEFAULT_PAGE;

  @IsNumber()
  @IsOptional()
  limit: number = DEFAULT_LIMIT;
}
