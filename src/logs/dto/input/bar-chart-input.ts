import { DATE_OPTION } from '@constants/enum/date-option.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class BarChartInput {
  @IsEnum(DATE_OPTION, {
    message: 'Date option must be either day or month or year.',
  })
  @IsNotEmpty()
  date_option: DATE_OPTION;
}
