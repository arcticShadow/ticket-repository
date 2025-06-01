import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../database/entities/event.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TicketAllocation } from '../database/entities/ticket-allocation.entity';
import { EventStatisticsModule } from './statistics/event-statistics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, TicketAllocation]),
    EventStatisticsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
