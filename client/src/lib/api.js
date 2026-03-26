const TOKEN_KEY = 'renderforge_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('renderforge_session');
  localStorage.removeItem('renderforge_api_key');
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (response.status === 401) {
    const error = new Error(payload.error || 'Oturum süresi dolmuş.');
    error.code = payload.code || 'UNAUTHORIZED';
    error.status = 401;
    throw error;
  }

  if (!response.ok || payload.success === false) {
    const error = new Error(payload.error || 'API isteği başarısız oldu');
    error.code = payload.code;
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const api = {
  register(body) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  login(body) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  getMe() {
    return request('/api/auth/me');
  },
  logout() {
    return request('/api/auth/logout', { method: 'POST' }).catch(() => {});
  },
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
