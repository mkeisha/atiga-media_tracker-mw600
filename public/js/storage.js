const MediaStore = (() => {
  async function request(url, options = {}) {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) throw new Error(data?.error || "Request failed.");
    return data;
  }

  function getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/api/media${query ? `?${query}` : ""}`);
  }

  function getById(id) {
    return request(`/api/media/${encodeURIComponent(id)}`);
  }

  function add(item) {
    return request("/api/media", { method: "POST", body: JSON.stringify(item) });
  }

  function update(id, changes) {
    return request(`/api/media/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(changes),
    });
  }

  function remove(id) {
    return request(`/api/media/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  function getStats() {
    return request("/api/stats");
  }

  return { getAll, getById, add, update, remove, getStats };
})();