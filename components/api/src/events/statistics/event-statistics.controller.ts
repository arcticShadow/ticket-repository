import { Controller, Param, ParseUUIDPipe, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  EventStatisticsService,
  EventStatistics,
} from './event-statistics.service';
import { UUID } from 'node:crypto';

@Controller('events')
export class EventStatisticsController {
  constructor(private readonly statisticsService: EventStatisticsService) {}

  @Sse(':id/stream')
  async streamEventStatistics(
    @Param('id', ParseUUIDPipe) eventId: UUID,
  ): Promise<
    Observable<{
      data: EventStatistics;
      type: string;
      id: string;
      retry: number;
    }>
  > {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (await this.statisticsService.getEventStream(eventId)).pipe(
      map((stats: EventStatistics) => ({
        data: stats,
        type: 'message',
        id: Date.now().toString(),
        retry: 1000,
      })),
    );
  }
}
