import api from '../lib/api';
import { Expert, ExpertFilters, LookupValue } from '../types/expert';

export const expertService = {
  async getAll(filters: ExpertFilters = {}) {
    // Map frontend filter names to backend parameter names
    const { expert_status_id, ...otherFilters } = filters;
    const { data } = await api.get<any>('/experts', {
      params: {
        ...otherFilters,
        status_id: expert_status_id,
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

  // ── File Upload Methods ──

  async getUploadUrl(expertId: string, filename: string, contentType: string = 'application/pdf') {
    const { data } = await api.post(`/experts/${expertId}/files/upload-url`, {
      filename,
      content_type: contentType
    });
    return data;
  },

  async uploadFileToUrl(uploadUrl: string, file: File) {
    // Upload directly to MinIO/S3 using the presigned URL
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/pdf'
      }
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.statusText}`);
    }

    return true;
  },

  async confirmFileUpload(
    expertId: string,
    s3Key: string,
    filename: string,
    fileSizeKb: number,
    mimeType: string = 'application/pdf',
    isPrimary: boolean = false
  ) {
    const { data } = await api.post(`/experts/${expertId}/files/confirm`, {
      s3_key: s3Key,
      filename,
      file_size_kb: fileSizeKb,
      mime_type: mimeType,
      is_primary: isPrimary
    });
    return data;
  },

  async uploadExpertFile(expertId: string, file: File) {
    // Step 1: Get presigned upload URL
    const uploadData = await this.getUploadUrl(expertId, file.name, file.type);

    // Step 2: Upload file directly to MinIO
    await this.uploadFileToUrl(uploadData.upload_url, file);

    // Step 3: Confirm upload and create database record
    const fileRecord = await this.confirmFileUpload(
      expertId,
      uploadData.s3_key,
      file.name,
      Math.ceil(file.size / 1024),  // Convert bytes to KB
      file.type || 'application/pdf',
      false  // is_primary
    );

    return fileRecord;
  },

  async getLookups(category: string) {
    const { data } = await api.get<LookupValue[]>(`/lookups/${category}`);
    return data;
  },
};
