import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, Subject } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../database/entities/event.entity';
import {
  TicketAllocation,
  TicketAllocationStatus,
} from '../../database/entities/ticket-allocation.entity';
import { UUID } from 'node:crypto';

export interface EventStatistics {
  totalTickets: number;
  remainingTickets: number;
  allocatedTickets: number;
  confirmedTickets: number;
  lastEvent?: {
    type: string;
    actor: string;
    timestamp: string;
  };
}

@Injectable()
export class EventStatisticsService {
  private readonly logger = new Logger(EventStatisticsService.name);
  private eventStreams = new Map<string, Subject<EventStatistics>>();

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(TicketAllocation)
    private ticketAllocationRepository: Repository<TicketAllocation>,
  ) {
    // Listen for ticket events
    this.eventEmitter.on('ticket.purchased', (payload) => {
      void this.handleTicketEvent(payload);
    });
    this.eventEmitter.on('ticket.confirmed', (payload) => {
      void this.handleTicketEvent(payload);
    });
    this.eventEmitter.on('ticket.cancelled', (payload) => {
      void this.handleTicketEvent(payload);
    });
    this.eventEmitter.on('ticket.expired', (payload) => {
      void this.handleTicketEvent(payload);
    });
  }

  private async getEventStatistics(eventId: UUID): Promise<EventStatistics> {
    try {
      this.logger.debug(`Getting statistics for event ${eventId}`);

      const event = await this.eventRepository.findOne({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }

      interface TicketCounts {
        allocatedCount: string;
        confirmedCount: string;
      }

      const stats = await this.ticketAllocationRepository
        .createQueryBuilder('allocation')
        .select(
          'COUNT(CASE WHEN allocation.status = :reserved THEN 1 END)',
          'allocatedCount',
        )
        .addSelect(
          'COUNT(CASE WHEN allocation.status = :purchased THEN 1 END)',
          'confirmedCount',
        )
        .where('allocation.eventId = :eventId', { eventId })
        .setParameter('reserved', TicketAllocationStatus.RESERVED)
        .setParameter('purchased', TicketAllocationStatus.PURCHASED)
        .getRawOne<TicketCounts>();

      const allocatedCount = Number(stats?.allocatedCount || 0);
      const confirmedCount = Number(stats?.confirmedCount || 0);

      this.logger.debug(
        `Statistics for event ${eventId}: ${JSON.stringify({
          totalTickets: event.totalTickets,
          allocatedCount,
          confirmedCount,
        })}`,
      );

      return {
        totalTickets: event.totalTickets,
        remainingTickets: event.totalTickets - allocatedCount - confirmedCount,
        allocatedTickets: allocatedCount,
        confirmedTickets: confirmedCount,
      };
    } catch (error) {
      this.logger.error(
        `Error getting statistics for event ${eventId}:`,
        error,
      );
      throw error;
    }
  }

  private async handleTicketEvent(payload: {
    eventId: UUID;
    type: string;
    actor: string;
  }) {
    try {
      const { eventId, type, actor } = payload;
      const stats = await this.getEventStatistics(eventId);

      // Add last event info
      stats.lastEvent = {
        type,
        actor,
        timestamp: new Date().toISOString(),
      };

      this.broadcastStatistics(eventId, stats);
    } catch (error) {
      this.logger.error('Error handling ticket event:', error);
    }
  }

  private broadcastStatistics(eventId: UUID, stats: EventStatistics) {
    const stream = this.eventStreams.get(eventId);
    if (stream) {
      stream.next(stats);
    }
  }

  async getEventStream(eventId: UUID): Promise<Observable<EventStatistics>> {
    try {
      this.logger.debug(`Creating stream for event ${eventId}`);

      if (!this.eventStreams.has(eventId)) {
        this.eventStreams.set(eventId, new Subject<EventStatistics>());
      }
      const stream = this.eventStreams.get(eventId)!;

      // Emit current statistics
      const currentStats = await this.getEventStatistics(eventId);
      stream.next(currentStats);

      return stream.asObservable();
    } catch (error) {
      this.logger.error(`Error creating stream for event ${eventId}:`, error);
      throw error;
    }
  }

  cleanupStream(eventId: UUID) {
    const stream = this.eventStreams.get(eventId);
    if (stream) {
      stream.complete();
      this.eventStreams.delete(eventId);
    }
  }
}
