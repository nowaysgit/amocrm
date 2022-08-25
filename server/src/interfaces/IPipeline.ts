import { IStatus } from './IStatus';

export interface IPipeline {
  id: number;
  name: string;
  sort: number;
  is_main: boolean;
  is_unsorted_on: boolean;
  is_archive: boolean;
  account_id: number;
  _links: any;
  _embedded: {
    statuses: IStatus[];
  };
}
