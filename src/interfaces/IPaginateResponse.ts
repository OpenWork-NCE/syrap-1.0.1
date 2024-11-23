export default interface IPaginateResponse<T> {
  items: T[];
  limit: number;
  total: number;
  page: number;
  totalPages: number;
}
