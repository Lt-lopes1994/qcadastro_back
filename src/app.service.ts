import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Up and running! Welcome to the NestJS application!';
  }
}
