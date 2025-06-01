import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestController } from './test.controller';
import { TicketAllocation } from '../database/entities/ticket-allocation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketAllocation])],
  controllers: [TestController],
})
export class TestModule {}
