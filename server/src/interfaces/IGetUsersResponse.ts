import { IUser } from './IUser';

export interface IGetUsersResponse {
  data: {
    _total_items: number;
    _page: number;
    _page_count: number;
    _links: any;
    _embedded: {
      users: IUser[];
    };
  };
}
