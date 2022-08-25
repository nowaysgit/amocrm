import { Injectable } from '@nestjs/common';
import { ILead } from './interfaces/ILead';
import { AmocrmService } from './amocrm.service';
import { IMessage } from './interfaces/IMessage';

@Injectable()
export class AppService {
  constructor(private readonly amocrmService: AmocrmService) {}

  async getLeads(query: string): Promise<ILead[] | IMessage> {
    return this.amocrmService.getLeads(query || '');
  }

  async Auth(code: string): Promise<IMessage> {
    if (code === undefined || code === null || code === '') {
      return { message: 'use code param! like /api/auth?code=', status: 403 };
    }
    return this.amocrmService.Auth(code);
  }
}
