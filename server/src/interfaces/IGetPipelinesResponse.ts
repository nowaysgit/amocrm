import { IPipeline } from './IPipeline';

export interface IGetPipelinesResponse {
  data: {
    _total_items: number;
    _links: any;
    _embedded: {
      pipelines: IPipeline[];
    };
  };
}
