import { IsInt, Min, Max, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseTicketDto {
  @ApiProperty({
    description: 'Number of tickets to purchase',
    minimum: 1,
    maximum: 10,
    example: 2,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;

  @ApiProperty({
    description: 'Device fingerprint for user identification',
    example: 'abc123xyz',
  })
  @IsString()
  userFingerprint: string;
}
