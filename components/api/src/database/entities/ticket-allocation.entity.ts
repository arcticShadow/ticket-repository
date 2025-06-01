import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { UUID } from 'node:crypto';

export enum TicketAllocationStatus {
  RESERVED = 'reserved',
  PURCHASED = 'purchased',
  EXPIRED = 'expired',
  USER_CANCELLED = 'user_cancelled',
}

@Entity('ticket_allocations')
@Index(['userFingerprint', 'status'])
export class TicketAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  //TODO: redundant property. accessible via event.
  @Column({ type: 'uuid' })
  eventId: UUID;
  //TODO: joining on UUID is inefficient
  @ManyToOne(() => Event, (event) => event.allocations)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  userFingerprint: string;

  @Column({
    type: 'enum',
    enum: TicketAllocationStatus,
    default: TicketAllocationStatus.RESERVED,
  })
  status: TicketAllocationStatus;

  //TODO: i don't think this is a good solution - its a stop gap so we we can use a single status column and get the right status, without needing to run a cron that correctly expires the ticket allocations
  get effectiveStatus(): TicketAllocationStatus {
    if (
      this.status === TicketAllocationStatus.RESERVED &&
      this.expiresAt > new Date()
    ) {
      return TicketAllocationStatus.EXPIRED;
    }
    return this.status;
  }

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
