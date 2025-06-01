import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'The name of the event',
    example: 'Summer Concert 2024',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The date and time of the event in ISO format',
    example: '2024-07-15T19:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'The total number of tickets available for the event',
    example: 100,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  totalTickets: number;
}
