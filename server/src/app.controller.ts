import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ILead } from './interfaces/ILead';
import { IMessage } from './interfaces/IMessage';
import { IUser } from './interfaces/IUser';
import { IPipeline } from './interfaces/IPipeline';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  root(): string {
    return 'Available only /api/leads, /api/auth';
  }

  @Get('/leads')
  getLeads(@Query('query') query: string): Promise<
    | {
        leads: ILead[] | IMessage;
        users: IUser[] | IMessage;
        pipeline: IPipeline | IMessage;
      }
    | IMessage
  > {
    return this.appService.getLeads(query);
  }

  @Get('/auth')
  Auth(@Query('code') code: string): Promise<IMessage> {
    return this.appService.Auth(code);
  }
}
