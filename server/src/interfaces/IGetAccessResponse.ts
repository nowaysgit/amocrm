import { IAccess } from './IAccess';

export interface IGetAccessResponse {
  message: string;
  code: string;
  status: number;
  data: IAccess;
}
