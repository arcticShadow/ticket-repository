import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventAndTicketAllocationTables1692380000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for ticket allocation status
    await queryRunner.query(`
      CREATE TYPE allocation_status AS ENUM ('reserved', 'purchased', 'expired')
    `);

    // Create events table
    await queryRunner.query(`
      CREATE TABLE events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        total_tickets INTEGER NOT NULL,
        allocated_tickets INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);

    // Create ticket_allocations table
    await queryRunner.query(`
      CREATE TABLE ticket_allocations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL REFERENCES events(id),
        user_fingerprint VARCHAR NOT NULL,
        status allocation_status NOT NULL DEFAULT 'reserved',
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX idx_ticket_allocations_user_fingerprint_status 
      ON ticket_allocations(user_fingerprint, status)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_ticket_allocations_event_id 
      ON ticket_allocations(event_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_ticket_allocations_status 
      ON ticket_allocations(status)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_ticket_allocations_expires_at 
      ON ticket_allocations(expires_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_ticket_allocations_expires_at`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_ticket_allocations_status`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_ticket_allocations_event_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_ticket_allocations_user_fingerprint_status`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS ticket_allocations`);
    await queryRunner.query(`DROP TABLE IF EXISTS events`);

    // Drop enum
    await queryRunner.query(`DROP TYPE IF EXISTS allocation_status`);
  }
}
