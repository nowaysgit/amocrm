export interface IContact {
  id: number;
  name: string;
  responsible_user_id: number;
  created_by: number;
  custom_fields_values: any[];
  _embedded: any;
}
