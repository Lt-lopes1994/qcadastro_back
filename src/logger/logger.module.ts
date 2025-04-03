import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemLog } from './entities/system-log.entity';
import { LoggerService } from './service/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemLog])],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
