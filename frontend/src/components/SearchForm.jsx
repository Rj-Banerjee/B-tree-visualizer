import React, { useState } from 'react'
import { api } from '../utils/api'

export default function SearchForm({ onDone }) {
	const [rollNo, setRollNo] = useState('')
	const [loading, setLoading] = useState(false)

	const canSubmit = !!rollNo

	const submit = async (e) => {
		e.preventDefault()
		if (!canSubmit) return
		setLoading(true)
		try {
			const res = await api.search(Number(rollNo))
			onDone(res)
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={submit} className="space-y-3">
			<input value={rollNo} onChange={e=>setRollNo(e.target.value)} placeholder="Roll number" type="number" className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white placeholder-gray-400" />
			<button disabled={!canSubmit || loading} className={`w-full px-4 py-2.5 rounded-lg shadow-sm text-white ${(!canSubmit||loading)?'bg-blue-300':'bg-blue-600 hover:bg-blue-700'}`}>{loading ? 'Searching...' : 'Search'}</button>
		</form>
	)
}
