import { Module } from '@nestjs/common';
import { TutorController } from './tutor.controller';
import { TutorService } from './tutor.service';

@Module({
  controllers: [TutorController],
  providers: [TutorService]
})
export class TutorModule {}
