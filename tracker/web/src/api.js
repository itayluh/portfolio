async function req(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listItems: () => req("/api/items"),
  addItem: (body) => req("/api/items", { method: "POST", body }),
  updateItem: (id, body) =>
    req(`/api/items/${id}`, { method: "PATCH", body }),
  deleteItem: (id) => req(`/api/items/${id}`, { method: "DELETE" }),
  testAlert: (id) =>
    req(`/api/items/${id}/test-alert`, { method: "POST" }),
  stats: () => req("/api/stats"),
  settings: () => req("/api/settings"),
  updateSettings: (body) =>
    req("/api/settings", { method: "PUT", body }),
};
