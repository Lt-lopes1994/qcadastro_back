import { Module } from '@nestjs/common';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './service/admin.service';

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [],
  // Add any other modules or services that are needed for the admin module
  // For example, if you have a UserService, you can import it here
  // and use it in the controllers or providers.
  // imports: [UserService],
  // controllers: [AdminController],
  // providers: [AdminService],
  // exports: [AdminService],
  // If you have any global services or providers, you can add them here
  // and they will be available throughout the application.
  // For example, if you have a LoggerService, you can import it here
  // and use it in the controllers or providers.
  // imports: [LoggerService],
})
export class AdminModule {}
