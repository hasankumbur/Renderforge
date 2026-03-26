function getApiKey() {
  return localStorage.getItem('renderforge_api_key') || import.meta.env.VITE_API_KEY || '';
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const apiKey = getApiKey();
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const error = new Error(payload.error || 'API isteği başarısız oldu');
    error.code = payload.code;
    throw error;
  }

  return payload;
}

export const api = {
  getTemplates() {
    return request('/api/templates');
  },
  getTemplate(id) {
    return request(`/api/templates/${id}`);
  },
  createTemplate(body) {
    return request('/api/templates', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  updateTemplate(id, body) {
    return request(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  deleteTemplate(id) {
    return request(`/api/templates/${id}`, {
      method: 'DELETE',
    });
  },
  uploadAsset(file) {
    const formData = new FormData();
    formData.append('file', file);

    return request('/api/assets/upload', {
      method: 'POST',
      body: formData,
    });
  },
  render(body) {
    return request('/api/render', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  getRenderHistory() {
    return request('/api/render/history');
  },
};
