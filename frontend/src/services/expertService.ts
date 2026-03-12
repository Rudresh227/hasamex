import api from '../lib/api';
import { Expert, ExpertFilters, LookupValue } from '../types/expert';

export const expertService = {
  async getAll(filters: ExpertFilters = {}) {
    const { data } = await api.get<any>('/experts', {
      params: {
        ...filters,
        sort_by: 'first_name',
        sort_order: 'asc'
      },
    });
    // Handle both paginated object and raw array from backend
    if (Array.isArray(data)) {
      return { items: data, total: data.length };
    }
    return data as { items: Expert[]; total: number };
  },

  async getById(id: string) {
    const { data } = await api.get<Expert>(`/experts/${id}`);
    return data;
  },

  async create(expert: Partial<Expert>) {
    const { data } = await api.post<Expert>('/experts', expert);
    return data;
  },

  async update(id: string, expert: Partial<Expert>) {
    const { data } = await api.patch<Expert>(`/experts/${id}`, expert);
    return data;
  },

  async delete(id: string) {
    await api.delete(`/experts/${id}`);
  },

  async getLookups(category: string) {
    const { data } = await api.get<LookupValue[]>(`/lookups/${category}`);
    return data;
  },
};
