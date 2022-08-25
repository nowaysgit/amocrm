import { ILead } from './ILead';

export interface IGetLeadsResponse {
  data: {
    _page: number;
    _links: any;
    _embedded: {
      leads: ILead[];
    };
  };
}
