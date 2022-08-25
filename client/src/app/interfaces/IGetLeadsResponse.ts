import { ILead } from './ILead';
import { IUser } from './IUser';
import { IPipeline } from './IPipeline';
import { IMessage } from './IMessage';

export interface IGetLeadsResponse {
  leads: ILead[] | IMessage;
  users: IUser[] | IMessage;
  pipeline: IPipeline | IMessage;
}
