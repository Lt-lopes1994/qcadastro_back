import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClickSignService } from './click-sign.service';
import { ClickSignController } from './click-sign.controller';
import { DocumentEntity } from './entities/document.entity';
import { UserModule } from '../user/user.module';
import { PortadorModule } from '../portador/portador.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentEntity]),
    UserModule,
    PortadorModule,
  ],
  providers: [ClickSignService],
  controllers: [ClickSignController],
  exports: [ClickSignService],
})
export class ClickSignModule {}
