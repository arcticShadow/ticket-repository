import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventStatisticsController } from './event-statistics.controller';
import { EventStatisticsService } from './event-statistics.service';
import { Event } from '../../database/entities/event.entity';
import { TicketAllocation } from '../../database/entities/ticket-allocation.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([Event, TicketAllocation]),
  ],
  controllers: [EventStatisticsController],
  providers: [EventStatisticsService],
  exports: [EventStatisticsService],
})
export class EventStatisticsModule {}
