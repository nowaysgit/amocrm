import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { DataService } from './data.service';
import { IGetLeadsResponse } from './interfaces/IGetLeadsResponse';
import { ILead } from './interfaces/ILead';
import { IGetAccessResponse } from './interfaces/IGetAccessResponse';
import { IMessage } from './interfaces/IMessage';

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

  async getLeads(query: string): Promise<ILead[] | IMessage> {
    try {
      const response = await this.httpService.axiosRef.get<
        IGetLeadsResponse,
        IGetLeadsResponse
      >(process.env.AMOCRM_API + '/api/v4/leads?query=' + query, {
        headers: {
          ...this.headers,
          Authorization: 'Bearer ' + this.dataService.data?.access_token || '',
        },
        baseURL: process.env.AMOCRM_SUBDOMAIN + '.amocrm.ru',
        withCredentials: true,
      });
      return response.data._embedded.leads;
    } catch (e) {
      if (e?.response?.data?.status === 401) {
        if (this.retryCount > 2) {
          this.retryCount = 0;
          return {
            message: 'You must update app auth => /api/auth?code=',
            status: 401,
          };
        }
        this.retryCount++;
        await this.UpdateAccess();
        return this.getLeads(query);
      }
      this.retryCount = 0;
      return this.ErrorHandler(e);
    }
  }

  async Auth(code: string): Promise<IMessage> {
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
      return this.ErrorHandler(e);
    }
  }

  private async UpdateAccess(): Promise<IMessage> {
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
      return this.ErrorHandler(e);
    }
  }

  ErrorHandler(e: any): any {
    if (
      e?.response?.status !== undefined &&
      e?.response?.status !== null &&
      e?.response?.status !== 200
    ) {
      return e.response.data || e;
    }
    return e;
  }
}
