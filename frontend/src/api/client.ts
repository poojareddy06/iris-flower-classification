import {
  User,
  Dataset,
  MLModel,
  PredictionResult,
  ImageAnalysisResult,
  SlideData,
  DashboardSummary,
  ChatMessage
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('iris_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed (${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  // Handle binary/file downloads
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('application/octet-stream') || contentType.includes('text/csv') || contentType.includes('presentation'))) {
    return response.blob() as unknown as T;
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    register: (name: string, email: string, password: string) =>
      request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      }),
    login: (email: string, password: string, remember_me = false) =>
      request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember_me }),
      }),
    getMe: () => request<User>('/auth/me'),
    updateSettings: (settings: Record<string, any>) =>
      request<{ status: string; settings: any }>('/auth/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }),
    forgotPassword: (email: string) =>
      request<{ status: string; message: string }>('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }),
    resetPassword: (email: string, new_password: string) =>
      request<{ status: string; message: string }>('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password }),
      }),
    deleteAccount: () =>
      request<{ status: string; message: string }>('/auth/account', {
        method: 'DELETE',
      }),
  },

  // Datasets
  datasets: {
    getAll: () => request<Dataset[]>('/datasets'),
    getById: (id: number, previewRows = 50) =>
      request<Dataset>(`/datasets/${id}?preview_rows=${previewRows}`),
    upload: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<Dataset>('/datasets/upload', {
        method: 'POST',
        body: formData,
      });
    },
    delete: (id: number) =>
      request<{ status: string; message: string }>(`/datasets/${id}`, {
        method: 'DELETE',
      }),
    clearUserDatasets: () =>
      request<{ status: string; message: string }>('/datasets/clear/user-datasets', {
        method: 'DELETE',
      }),
    downloadUrl: (id: number) => `${API_BASE}/datasets/${id}/download`,
  },

  // Models
  models: {
    getAll: () => request<MLModel[]>('/models'),
    getActive: () => request<MLModel>('/models/active'),
    getById: (id: number) => request<MLModel>(`/models/${id}`),
    train: (params: {
      dataset_id?: number;
      model_name?: string;
      criterion?: string;
      test_size?: number;
      random_state?: number;
      max_depth?: number | null;
      min_samples_split?: number;
      min_samples_leaf?: number;
    }) =>
      request<MLModel>('/models/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }),
    activate: (id: number) =>
      request<{ status: string; message: string }>(`/models/${id}/activate`, {
        method: 'POST',
      }),
    delete: (id: number) =>
      request<{ status: string; message: string }>(`/models/${id}`, {
        method: 'DELETE',
      }),
  },

  // Predictions
  predictions: {
    predict: (data: {
      model_id?: number;
      sepal_length: number;
      sepal_width: number;
      petal_length: number;
      petal_width: number;
    }) =>
      request<PredictionResult>('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    getHistory: (species?: string, sort_by = 'newest') => {
      const params = new URLSearchParams();
      if (species) params.append('species', species);
      params.append('sort_by', sort_by);
      return request<PredictionResult[]>(`/predict/history?${params.toString()}`);
    },
    deleteRecord: (id: number) =>
      request<{ status: string; message: string }>(`/predict/history/${id}`, {
        method: 'DELETE',
      }),
    clearAll: () =>
      request<{ status: string; message: string }>('/predict/history', {
        method: 'DELETE',
      }),
  },

  // Image Analyzer
  image: {
    analyze: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<ImageAnalysisResult>('/image/analyze', {
        method: 'POST',
        body: formData,
      });
    },
    getHistory: () => request<ImageAnalysisResult[]>('/image/history'),
    delete: (id: number) =>
      request<{ status: string; message: string }>(`/image/${id}`, {
        method: 'DELETE',
      }),
    clearHistory: () =>
      request<{ status: string; message: string }>('/image/history', {
        method: 'DELETE',
      }),
  },

  // AI Assistant
  assistant: {
    chat: (message: string, session_id = 'default', language = 'English') =>
      request<ChatMessage>('/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, session_id, language }),
      }),
    getHistory: (session_id = 'default') =>
      request<ChatMessage[]>(`/assistant/history?session_id=${session_id}`),
    clearHistory: (session_id = 'default') =>
      request<{ status: string; message: string }>(`/assistant/history?session_id=${session_id}`, {
        method: 'DELETE',
      }),
  },

  // Presentation
  presentation: {
    getSlides: () =>
      request<{
        title: string;
        student: string;
        roll_number: string;
        class: string;
        company: string;
        domain: string;
        total_slides: number;
        slides: SlideData[];
      }>('/presentation/slides'),
    getSlide: (num: number) => request<SlideData>(`/presentation/slide/${num}`),
    downloadPPTXUrl: () => `${API_BASE}/presentation/download-pptx`,
  },

  // Analytics
  analytics: {
    getDashboard: () => request<DashboardSummary>('/analytics/dashboard'),
    getModelAnalytics: (modelId: number) => request<any>(`/analytics/model/${modelId}`),
  },

  // Admin
  admin: {
    getUsers: () => request<User[]>('/admin/users'),
    getStats: () => request<any>('/admin/stats'),
    getLogs: () => request<any[]>('/admin/logs'),
  },

  // Export
  export: {
    predictionsCSVUrl: () => `${API_BASE}/export/predictions`,
    getModelReport: (modelId: number) => request<any>(`/export/model-report/${modelId}`),
    modelReportHtmlUrl: (modelId: number) => `${API_BASE}/export/model-report/${modelId}/html`,
  },
};
