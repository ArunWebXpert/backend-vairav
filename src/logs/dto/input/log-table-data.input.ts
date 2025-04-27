import * as dayjs from 'dayjs';
import { IsDate, IsOptional, IsString, MaxDate } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationInput } from './pagination.input';

export class LogTableDataInput extends PaginationInput {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }: { value: string | undefined }) =>
    value ? dayjs(value).startOf('day').toDate() : undefined,
  )
  @IsDate()
  @MaxDate(dayjs().toDate(), { message: 'Start date cannot be future date.' })
  startDate?: Date;

  @IsOptional()
  @Transform(({ value }: { value: string | undefined }) =>
    value ? dayjs(value).endOf('day').toDate() : undefined,
  )
  @IsDate()
  @MaxDate(dayjs().toDate(), { message: 'End date cannot be future date.' })
  endDate?: Date;
}
