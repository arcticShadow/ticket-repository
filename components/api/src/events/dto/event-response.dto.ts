import { ApiProperty } from '@nestjs/swagger';

export class EventResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the event',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the event',
    example: 'Summer Concert 2024',
  })
  name: string;

  @ApiProperty({
    description: 'The date and time of the event in ISO format',
    example: '2024-07-15T19:00:00Z',
  })
  date: string;

  @ApiProperty({
    description: 'The total number of tickets for the event',
    example: 100,
  })
  totalTickets: number;

  @ApiProperty({
    description: 'The number of tickets currently allocated',
    example: 15,
  })
  allocatedTickets: number;

  @ApiProperty({
    description: 'The number of tickets still available for purchase',
    example: 85,
  })
  availableTickets: number;

  @ApiProperty({
    description: 'The timestamp when the event was created',
    example: '2024-01-15T12:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'The timestamp when the event was last updated',
    example: '2024-01-15T12:00:00Z',
  })
  updatedAt: string;
}
