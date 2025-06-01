import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PaginationDto } from './dto/pagination.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { Event } from '../database/entities/event.entity';
import { TicketAllocation } from '../database/entities/ticket-allocation.entity';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { UUID } from 'node:crypto';
import { IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'Device fingerprint for user identification',
    example: 'abc123xyz',
  })
  @IsString()
  userFingerprint: string;
}

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Event created successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Event with this name and date already exists',
  })
  async create(
    @Body() createEventDto: CreateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.create(createEventDto);
    return this.mapToResponseDto(event);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of events',
    type: [EventResponseDto],
  })
  async findAll(@Query() paginationDto: PaginationDto): Promise<{
    data: EventResponseDto[];
    meta: { total: number; page: number; limit: number; pages: number };
  }> {
    const [events, total] = await this.eventsService.findAll(paginationDto);

    const { page, limit } = paginationDto;
    const pages = Math.ceil(total / limit);

    return {
      data: events.map((event) => this.mapToResponseDto(event)),
      meta: {
        total,
        page,
        limit,
        pages,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event details',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  async findOne(@Param('id') id: string): Promise<EventResponseDto> {
    const event = await this.eventsService.findOne(id);
    return this.mapToResponseDto(event);
  }

  @Post(':id/tickets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Purchase tickets for an event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiBody({ type: PurchaseTicketDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tickets reserved successfully',
    type: [TicketAllocation],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Not enough tickets available',
  })
  async purchaseTickets(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() purchaseTicketDto: PurchaseTicketDto,
  ): Promise<TicketAllocation[]> {
    return this.eventsService.purchaseTickets(id, purchaseTicketDto);
  }

  @Post('tickets/:id/payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm a ticket purchase' })
  @ApiParam({ name: 'id', description: 'Ticket allocation ID' })
  @ApiBody({ type: ConfirmPaymentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket purchase confirmed',
    type: TicketAllocation,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ticket allocation not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid allocation status, expired, or invalid user fingerprint',
  })
  async confirmPurchase(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<TicketAllocation> {
    return this.eventsService.confirmPurchase(
      id,
      confirmPaymentDto.userFingerprint,
    );
  }

  @Delete('tickets/:id/payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a ticket purchase' })
  @ApiParam({ name: 'id', description: 'Ticket allocation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket purchase cancelled',
    type: TicketAllocation,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ticket allocation not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Can only cancel reserved tickets',
  })
  async cancelPurchase(
    @Param('id', ParseUUIDPipe) id: UUID,
  ): Promise<TicketAllocation> {
    return this.eventsService.cancelPurchase(id);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get a ticket allocation by ID' })
  @ApiParam({ name: 'id', description: 'Ticket allocation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket allocation details',
    type: TicketAllocation,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ticket allocation not found',
  })
  async getTicketAllocation(
    @Param('id', ParseUUIDPipe) id: UUID,
  ): Promise<TicketAllocation> {
    return this.eventsService.getTicketAllocation(id);
  }

  private mapToResponseDto(event: Event): EventResponseDto {
    return {
      id: event.id,
      name: event.name,
      date: event.date.toISOString(),
      totalTickets: event.totalTickets,
      allocatedTickets: event.allocatedTickets,
      availableTickets: event.availableTickets,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  }
}
