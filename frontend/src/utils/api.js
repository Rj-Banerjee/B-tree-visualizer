const envBase = import.meta.env.VITE_API_BASE_URL
const DEFAULT_DEV = 'http://localhost:5000'
const DEFAULT_FALLBACK = 'http://localhost:4000'
// Prefer explicit env; otherwise choose sensible default per mode
const BASE = envBase || (import.meta.env.PROD ? DEFAULT_DEV : DEFAULT_DEV) || DEFAULT_FALLBACK

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
