const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

async function req(path, opts = {}) {
	const r = await fetch(`${BASE}${path}`, {
		headers: { 'Content-Type': 'application/json' },
		...opts,
	})
	if (!r.ok) throw new Error(await r.text())
	return r.json()
}

export const api = {
	getTree: () => req('/api/getTree'),
	insert: (payload) => req('/api/insert', { method: 'POST', body: JSON.stringify(payload) }),
	search: (rollNo) => req(`/api/search/${rollNo}`),
	delete: (rollNo) => req(`/api/delete/${rollNo}`, { method: 'DELETE' }),
	reset: () => req('/api/reset', { method: 'POST' }),
}
