import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Request } from 'express';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { LoggingInterceptor } from 'src/logger/logger.interceptor';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              levelFirst: true,
              translateTime: 'SYS:standard',
              // dont be so verbose with the logging
              ignore: 'req,res,req.headers,res.headers',
            },
          },
          level: configService.get('LOG_LEVEL', 'info'),
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.headers["set-cookie"]',
              'req.body.password',
            ],
            censor: '***REDACTED***',
          },
        },
      }),
    }),
  ],
  providers: [
    {
      // Global Logging interceptor
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
