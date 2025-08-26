import { getAuthToken } from '../config/auth';

const API_BASE = 'http://localhost:8089/rest';

const search = async ({ numeroContrat, numeroAffiliation }) => {
  const resp = await fetch(`${API_BASE}/api/beneficiaires/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({ numeroContrat, numeroAffiliation })
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status} - ${text}`);
  }

  const data = await resp.json();
  const liste = data?.beneficiaires ?? data?.data ?? [];
  return Array.isArray(liste) ? liste : [];
};

const add = async (payload) => {
  const resp = await fetch(`${API_BASE}/api/beneficiaires`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status} - ${text}`);
  }
  return resp.json();
};

export default { search, add };
