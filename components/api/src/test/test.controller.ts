import {
  Controller,
  Post,
  Param,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketAllocation } from '../database/entities/ticket-allocation.entity';

@ApiTags('test')
@Controller('test')
export class TestController {
  constructor(
    @InjectRepository(TicketAllocation)
    private readonly ticketAllocationRepository: Repository<TicketAllocation>,
  ) {}

  @Post('tickets/:id/expire')
  @UsePipes(new ParseUUIDPipe())
  @ApiOperation({ summary: 'Expire a ticket allocation (test only)' })
  @ApiParam({ name: 'id', description: 'Ticket allocation ID' })
  async expireTicket(@Param('id') id: string): Promise<void> {
    await this.ticketAllocationRepository.update(id, {
      expiresAt: new Date(Date.now() - 1000), // Set to 1 second ago
    });
  }
}
