import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Event } from '../database/entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import {
  TicketAllocation,
  TicketAllocationStatus,
} from '../database/entities/ticket-allocation.entity';
import { UUID } from 'node:crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventStatisticsService } from './statistics/event-statistics.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(TicketAllocation)
    private ticketAllocationRepository: Repository<TicketAllocation>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    private statisticsService: EventStatisticsService,
  ) {}

  // TODO: not great to pas the DTO directly to the service - smells of a bad abstraction
  async create(createEventDto: CreateEventDto): Promise<Event> {
    // Check if event with same name and date exists
    const existingEvent = await this.eventRepository.findOne({
      where: {
        name: createEventDto.name,
        date: new Date(createEventDto.date),
      },
    });

    if (existingEvent) {
      // While its OK for this Small app - Throwing an HTTP error here directly is not scalable
      throw new ConflictException(
        'Event with this name and date already exists',
      );
    }

    const event = this.eventRepository.create({
      name: createEventDto.name,
      date: new Date(createEventDto.date),
      totalTickets: createEventDto.totalTickets,
      allocatedTickets: 0,
    });

    const savedEvent = await this.eventRepository.save(event);

    return savedEvent;
  }

  //TODO: Not great to pass the DTO into the service
  async findAll(paginationDto: PaginationDto): Promise<[Event[], number]> {
    const { page, limit } = paginationDto;

    return this.eventRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        date: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    return event;
  }

  //TODO: Not great to pass the DTO into the service
  async purchaseTickets(
    eventId: UUID,
    purchaseTicketDto: PurchaseTicketDto,
  ): Promise<TicketAllocation[]> {
    const queryRunner = this.dataSource.createQueryRunner('master');
    //TODO:  I feel like this connect shouldn't be needed.
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the event row and check availability
      const event = await queryRunner.manager
        .createQueryBuilder(Event, 'event')
        .setLock('pessimistic_write')
        .where('event.id = :id', { id: eventId })
        .getOne();

      if (!event) {
        throw new NotFoundException(`Event with ID "${eventId}" not found`);
      }

      if (event.availableTickets < purchaseTicketDto.quantity) {
        throw new ConflictException('Not enough tickets available');
      }

      // Create ticket allocation for every requests ticket
      const allocations = this.ticketAllocationRepository.create(
        Array.from({ length: purchaseTicketDto.quantity }).map(() => ({
          eventId,
          userFingerprint: purchaseTicketDto.userFingerprint,
          status: TicketAllocationStatus.RESERVED,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
        })),
      );

      // Update event ticket count
      event.allocatedTickets += purchaseTicketDto.quantity;

      //save the models
      await queryRunner.manager.save(allocations);
      await queryRunner.manager.save(event);

      //commit the transaction, which releases the lock
      await queryRunner.commitTransaction();

      // Emit ticket purchased event
      this.eventEmitter.emit('ticket.purchased', {
        eventId,
        type: 'ticket.purchased',
        actor: purchaseTicketDto.userFingerprint,
      });

      return allocations;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmPurchase(
    allocationId: UUID,
    userFingerprint: string,
  ): Promise<TicketAllocation> {
    const allocation = await this.ticketAllocationRepository.findOne({
      where: { id: allocationId },
    });

    if (!allocation) {
      throw new NotFoundException(`Ticket allocation not found`);
    }

    if (allocation.status !== TicketAllocationStatus.RESERVED) {
      throw new BadRequestException('Invalid allocation status');
    }
    if (allocation.userFingerprint !== userFingerprint) {
      throw new BadRequestException('Invalid user fingerprint');
    }

    // TODO: This will forcibly update the allocation at the time of attempted purchase
    // if the expiry has past. Its nice for this sample app - but its a terrible idea
    // to rely on this for a production app. A better solution is for an external system
    // to trigger the expiration of an allocation. This is a great discussion topic - i
    // don't know at this point how you would efficiently achieve this. My instinct is it
    // would be an external queue of some description, that is updated with actions
    // when an allocation is made, and the action is revoked when an allocation is
    // successfully converted
    if (allocation.expiresAt < new Date()) {
      allocation.status = TicketAllocationStatus.EXPIRED;
      await this.ticketAllocationRepository.save(allocation);

      // Emit ticket expired event
      this.eventEmitter.emit('ticket.expired', {
        eventId: allocation.eventId,
        type: 'ticket.expired',
        actor: userFingerprint,
      });

      throw new BadRequestException('Ticket allocation has expired');
    }

    allocation.status = TicketAllocationStatus.PURCHASED;
    const savedAllocation =
      await this.ticketAllocationRepository.save(allocation);

    // Emit ticket confirmed event
    this.eventEmitter.emit('ticket.confirmed', {
      eventId: allocation.eventId,
      type: 'ticket.confirmed',
      actor: userFingerprint,
    });

    return savedAllocation;
  }

  async cancelPurchase(allocationId: UUID): Promise<TicketAllocation> {
    const queryRunner = this.dataSource.createQueryRunner('master');
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const allocation = await queryRunner.manager.findOne(TicketAllocation, {
        where: { id: allocationId },
      });

      const event = await queryRunner.manager.findOne(Event, {
        where: { id: allocation?.eventId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!allocation) {
        throw new NotFoundException(`Ticket allocation not found`);
      }

      if (allocation.status !== TicketAllocationStatus.RESERVED) {
        throw new BadRequestException('Can only cancel reserved tickets');
      }

      if (event) {
        event.allocatedTickets -= 1;
        await queryRunner.manager.save(event);
      }

      // Update allocation status
      allocation.status = TicketAllocationStatus.USER_CANCELLED;
      const updatedAllocation = await queryRunner.manager.save(allocation);

      await queryRunner.commitTransaction();

      // Emit ticket cancelled event
      this.eventEmitter.emit('ticket.cancelled', {
        eventId: allocation.eventId,
        type: 'ticket.cancelled',
        actor: allocation.userFingerprint,
      });

      return updatedAllocation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTicketAllocation(id: UUID): Promise<TicketAllocation> {
    const allocation = await this.ticketAllocationRepository.findOne({
      where: { id },
    });

    if (!allocation) {
      throw new NotFoundException(`Ticket allocation not found`);
    }

    return allocation;
  }
}
