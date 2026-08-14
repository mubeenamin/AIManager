const API_BASE_URL = 'http://localhost:8000/api/v1';

let authToken: string | null = localStorage.getItem('aimanager_token');
let activeBusinessId: string | null = localStorage.getItem('aimanager_business_id') || 'biz-apex-retail';
let activeUserRole: string | null = localStorage.getItem('aimanager_role') || 'SUPERVISOR';

export function setApiAuth(token: string | null, businessId?: string, role?: string) {
  authToken = token;
  if (token) localStorage.setItem('aimanager_token', token);
  else localStorage.removeItem('aimanager_token');

  if (businessId) {
    activeBusinessId = businessId;
    localStorage.setItem('aimanager_business_id', businessId);
  }

  if (role) {
    activeUserRole = role;
    localStorage.setItem('aimanager_role', role);
  }
}

export function getActiveBusinessId() {
  return activeBusinessId || 'biz-apex-retail';
}

export function getActiveRole() {
  return activeUserRole || 'SUPERVISOR';
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (activeBusinessId) {
    headers['X-Business-ID'] = activeBusinessId;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as T;
}
