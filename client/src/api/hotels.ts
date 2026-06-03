import api from './axios';
import { Hotel, ApiResponse, SearchParams } from '../types';

export const hotelsApi = {
  getAll: () =>
    api.get<ApiResponse<Hotel[]>>('/hotels'),

  getById: (id: string) =>
    api.get<ApiResponse<Hotel>>(`/hotels/${id}`),

  search: (params: SearchParams) =>
    api.get<ApiResponse<Hotel[]>>('/hotels/search', { params }),
};
