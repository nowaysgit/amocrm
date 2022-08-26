import { Injectable } from '@nestjs/common';
import { ILead } from './interfaces/ILead';
import { AmocrmService } from './amocrm.service';
import { IMessage } from './interfaces/IMessage';
import { IUser } from './interfaces/IUser';
import { IPipeline } from './interfaces/IPipeline';

@Injectable()
export class AppService {
  constructor(private readonly amocrmService: AmocrmService) {}

  async getLeads(query: string): Promise<
    | {
        leads: ILead[] | IMessage;
        users: IUser[] | IMessage;
        pipeline: IPipeline | IMessage;
      }
    | IMessage
  > {
    if (!query || query.length < 3) {
      query = '';
    }
    const leads: ILead[] | IMessage = await this.amocrmService.getLeads(
      encodeURIComponent(query) || '',
    );
    const users: IUser[] | IMessage = await this.amocrmService.getUsers();
    const pipeline: IPipeline[] | IMessage =
      await this.amocrmService.getPipelines();

    return {
      leads: leads,
      users: users,
      pipeline: Array.isArray(pipeline) ? pipeline[0] : pipeline,
    };
  }

  async Auth(code: string): Promise<IMessage> {
    if (code === undefined || code === null || code === '') {
      return { message: 'use code param! like /api/auth?code=', status: 403 };
    }
    return this.amocrmService.auth(code);
  }
}
