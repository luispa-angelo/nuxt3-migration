export interface IBaseResponse {
  data: [] | object;
  success?: boolean;
  page?: IPagination;
  hasNext?: boolean;
  total?: number;
}

export interface IPagination {
  page?: number;
  hasNext?: boolean;
  total?: number;
  dataUpdate?: boolean;
}
