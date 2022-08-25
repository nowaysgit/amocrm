import { IContact } from './IContact';

export interface ILead {
  id: number;
  name: string;
  price: number;
  responsible_user_id: number;
  status_id: number;
  created_at: number;
  custom_fields_values: any;
  _embedded: {
    tags: any[];
    contacts: IContact[];
  };
  status_text?: string;
  responsible_user_text?: string;
  created_at_formatted?: string;
  price_formatted?: string;
  color?: string;
}
