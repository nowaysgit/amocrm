import { IContact } from './IContact';

export interface IGetContactsResponse {
  data: {
    _page: number;
    _links: any;
    _embedded: {
      contacts: IContact[];
    };
  };
}
