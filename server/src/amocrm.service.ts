import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { DataService } from './data.service';
import { IGetLeadsResponse } from './interfaces/IGetLeadsResponse';
import { ILead } from './interfaces/ILead';
import { IGetAccessResponse } from './interfaces/IGetAccessResponse';
import { IMessage } from './interfaces/IMessage';
import { IPipeline } from './interfaces/IPipeline';
import { IGetPipelinesResponse } from './interfaces/IGetPipelinesResponse';
import { IGetUsersResponse } from './interfaces/IGetUsersResponse';
import { IUser } from './interfaces/IUser';
import { IContact } from './interfaces/IContact';
import { IGetContactsResponse } from './interfaces/IGetContactsResponse';

@Injectable()
export class AmocrmService {
  constructor(
    private readonly httpService: HttpService,
    private readonly dataService: DataService,
  ) {}

  private headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'amoCRM-oAuth-client/1.0',
  };

  private data = {
    client_id: String(process.env.AMOCRM_CLIENT_ID),
    client_secret: String(process.env.AMOCRM_CLIENT_ID_SECRET),
    redirect_uri: String(process.env.CLIENT_HOST),
  };

  private retryCount = 0;

  public async getLeads(query: string): Promise<ILead[] | IMessage> {
    try {
      const response = await this.httpService.axiosRef.get<
        IGetLeadsResponse,
        IGetLeadsResponse
      >(process.env.AMOCRM_API + '/api/v4/leads?with=contacts&query=' + query, {
        headers: {
          ...this.headers,
          Authorization: 'Bearer ' + this.dataService.data?.access_token || '',
        },
        baseURL: process.env.AMOCRM_SUBDOMAIN + '.amocrm.ru',
        withCredentials: true,
      });
      const contacts = await this.getContacts();
      return response.data._embedded.leads.map((lead) => {
        lead._embedded.contacts = lead._embedded.contacts.map((contact) =>
          (contacts as IContact[]).find((info) => info.id === contact.id),
        );
        return lead;
      });
    } catch (e) {
      return this.errorHandler(e, this.getLeads);
    }
  }

  private async getContacts(): Promise<IContact[] | IMessage> {
    try {
      const response = await this.httpService.axiosRef.get<
        IGetContactsResponse,
        IGetContactsResponse
      >(process.env.AMOCRM_API + '/api/v4/contacts', {
        headers: {
          ...this.headers,
          Authorization: 'Bearer ' + this.dataService.data?.access_token || '',
        },
        baseURL: process.env.AMOCRM_SUBDOMAIN + '.amocrm.ru',
        withCredentials: true,
      });
      return response.data._embedded.contacts;
    } catch (e) {
      return this.errorHandler(e, this.getContacts);
    }
  }

  public async getPipelines(): Promise<IPipeline[] | IMessage> {
    try {
      const response = await this.httpService.axiosRef.get<
        IGetPipelinesResponse,
        IGetPipelinesResponse
      >(process.env.AMOCRM_API + '/api/v4/leads/pipelines', {
        headers: {
          ...this.headers,
          Authorization: 'Bearer ' + this.dataService.data?.access_token || '',
        },
        baseURL: process.env.AMOCRM_SUBDOMAIN + '.amocrm.ru',
        withCredentials: true,
      });
      return response.data._embedded.pipelines;
    } catch (e) {
      return this.errorHandler(e, this.getPipelines);
    }
  }

  public async getUsers(): Promise<IUser[] | IMessage> {
    try {
      const response = await this.httpService.axiosRef.get<
        IGetUsersResponse,
        IGetUsersResponse
      >(process.env.AMOCRM_API + '/api/v4/users', {
        headers: {
          ...this.headers,
          Authorization: 'Bearer ' + this.dataService.data?.access_token || '',
        },
        baseURL: process.env.AMOCRM_SUBDOMAIN + '.amocrm.ru',
        withCredentials: true,
      });
      return response.data._embedded.users;
    } catch (e) {
      return this.errorHandler(e, this.getUsers);
    }
  }

  public async auth(code: string): Promise<IMessage> {
    try {
      const data = {
        ...this.data,
        grant_type: 'authorization_code',
        code: code,
      };
      const response = await this.httpService.axiosRef.post<
        IGetAccessResponse,
        IGetAccessResponse
      >(process.env.AMOCRM_API + '/oauth2/access_token', data, {
        headers: this.headers,
        baseURL: process.env.AMOCRM_SUBDOMAIN + '.amocrm.ru',
        withCredentials: true,
      });
      const { access_token, refresh_token } = response.data;
      await this.dataService.updateData({ access_token, refresh_token });
      return { message: 'OK', status: 200 };
    } catch (e) {
      return this.errorHandler(e);
    }
  }

  private async updateAccess(): Promise<IMessage> {
    try {
      const data = {
        ...this.data,
        grant_type: 'refresh_token',
        refresh_token: this.dataService.data?.refresh_token || '',
      };
      const response = await this.httpService.axiosRef.post<
        IGetAccessResponse,
        IGetAccessResponse
      >(process.env.AMOCRM_API + '/oauth2/access_token', data, {
        headers: this.headers,
        baseURL: process.env.AMOCRM_SUBDOMAIN + '.amocrm.ru',
        withCredentials: true,
      });
      const { access_token, refresh_token } = response.data;
      await this.dataService.updateData({ access_token, refresh_token });
      return { message: 'OK', status: 200 };
    } catch (e) {
      return this.errorHandler(e);
    }
  }

  private async errorHandler(e: any, retry: any = null): Promise<any> {
    if (retry) {
      if (e?.response?.data?.status === 401) {
        if (this.retryCount > 2) {
          this.retryCount = 0;
          return {
            message: 'You must update app auth => /api/auth?code=',
            status: 401,
          };
        }
        this.retryCount++;
        await this.updateAccess();
        return await retry();
      }
      this.retryCount = 0;
    }
    if (
      e?.response?.status !== undefined &&
      e?.response?.status !== null &&
      e?.response?.status !== 200
    ) {
      return {
        message: e.response.data || e,
        status: 401,
      };
    }
    return {
      message: e,
      status: 401,
    };
  }
}
