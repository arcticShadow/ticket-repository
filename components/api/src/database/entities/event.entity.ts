import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketAllocation } from './ticket-allocation.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'timestamp with time zone' })
  date: Date;

  @Column({ type: 'int' })
  totalTickets: number;

  @Column({ type: 'int', default: 0 })
  allocatedTickets: number;

  @OneToMany(() => TicketAllocation, (allocation) => allocation.event)
  allocations: TicketAllocation[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  get availableTickets(): number {
    return this.totalTickets - this.allocatedTickets;
  }
}
