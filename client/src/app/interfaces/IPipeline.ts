import { IStatus } from './IStatus';

export interface IPipeline {
  id: number;
  name: string;
  _embedded: {
    statuses: IStatus[];
  };
}
