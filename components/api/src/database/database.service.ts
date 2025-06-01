import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Event } from './entities/event.entity';
import {
  TicketAllocation,
  TicketAllocationStatus,
} from './entities/ticket-allocation.entity';
import { UUID } from 'node:crypto';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(TicketAllocation)
    private ticketAllocationRepository: Repository<TicketAllocation>,

    private dataSource: DataSource,
  ) {}

  // Methods for Event entity
  async findAllEvents(): Promise<Event[]> {
    return this.eventRepository.find();
  }

  async findEventById(id: string): Promise<Event | null> {
    return this.eventRepository.findOne({
      where: { id },
      relations: ['allocations'],
    });
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    const event = this.eventRepository.create(eventData);
    return this.eventRepository.save(event);
  }

  /**
   * Main DB interaction to safely allocate a ticket Enforces no overselling via DB Transaction locking
   */
  async allocateTicket(
    eventId: UUID,
    userFingerprint: string,
  ): Promise<TicketAllocation> {
    // Use a transaction with FOR UPDATE lock to handle concurrency
    return this.dataSource.transaction(async (manager) => {
      // Lock the event row to prevent concurrent modifications
      const event = await manager
        .createQueryBuilder(Event, 'event')
        .where('event.id = :id', { id: eventId })
        .setLock('pessimistic_write')
        .getOne();

      if (!event) {
        throw new Error('Event not found');
      }

      // Check if tickets are available
      if (event.totalTickets <= event.allocatedTickets) {
        throw new Error('No tickets available');
      }

      // Create the ticket allocation
      const allocation = manager.create(TicketAllocation, {
        eventId,
        userFingerprint,
        status: TicketAllocationStatus.RESERVED,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      });

      // Increment the allocated tickets count
      event.allocatedTickets += 1;
      await manager.save(event);

      // Save and return the allocation
      return manager.save(allocation);
    });
  }

  /**
   * Return ticket to the pool
   */
  async updateAllocationStatus(
    id: UUID,
    status: TicketAllocationStatus,
  ): Promise<TicketAllocation> {
    const allocation = await this.ticketAllocationRepository.findOne({
      where: { id },
    });

    if (!allocation) {
      throw new Error('Ticket allocation not found');
    }

    allocation.status = status;

    if (status === TicketAllocationStatus.EXPIRED) {
      // If the allocation is expired, decrement the allocated tickets count
      return this.dataSource.transaction(async (manager) => {
        const event = await manager.findOne(Event, {
          where: { id: allocation.eventId },
        });

        if (event && allocation.status !== TicketAllocationStatus.EXPIRED) {
          event.allocatedTickets -= 1;
          await manager.save(event);
        }

        return manager.save(allocation);
      });
    }

    return this.ticketAllocationRepository.save(allocation);
  }
}
