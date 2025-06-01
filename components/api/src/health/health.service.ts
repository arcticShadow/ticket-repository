import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

@Injectable()
export class HealthService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async checkDatabaseHealth() {
    try {
      // Run a simple query to check if the database is reachable
      await this.dataSource.query('SELECT 1');

      // Get database statistics
      const stats = await this.getDatabaseStats();

      return {
        status: 'up',
        stats,
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async getDatabaseStats() {
    try {
      // Get Postgres version
      const versionResult =
        await this.dataSource.query<{ version: string }[]>('SELECT version()');
      const version = versionResult?.[0]?.version || 'Unknown';

      // Get connection info
      const connectionInfo = {
        database: this.dataSource.options.database as string,
        host: (this.dataSource.options as PostgresConnectionOptions)
          .host as string,
        port: (this.dataSource.options as PostgresConnectionOptions)
          .port as number,
      };

      // Get active connections count
      const connectionsResult = await this.dataSource.query<
        {
          active_connections: string;
        }[]
      >(
        `SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active'`,
      );
      const activeConnections = parseInt(
        connectionsResult?.[0]?.active_connections || '0',
        10,
      );

      // Get database size
      const sizeResult = await this.dataSource.query<{ size: string }[]>(
        `SELECT pg_size_pretty(pg_database_size(current_database())) as size`,
      );
      const size = sizeResult?.[0]?.size || 'Unknown';

      // Get table count
      const tableCountResult = await this.dataSource.query<
        {
          table_count: string;
        }[]
      >(
        `SELECT count(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'`,
      );
      const tableCount = parseInt(
        tableCountResult?.[0]?.table_count || '0',
        10,
      );

      return {
        version,
        connectionInfo,
        activeConnections,
        size,
        tableCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
