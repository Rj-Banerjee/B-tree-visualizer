import React, { useState } from 'react'
import { api } from '../utils/api'

export default function SearchForm({ onDone }) {
	const [rollNo, setRollNo] = useState('')
	const [loading, setLoading] = useState(false)
	const [touched, setTouched] = useState(false)

	const rollOk = /^\d{1,12}$/.test(rollNo)
	const canSubmit = rollOk

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
		<form onSubmit={submit} className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Roll number</label>
				<input
					value={rollNo}
					onChange={e=>setRollNo(e.target.value.replace(/\D+/g,''))}
					onBlur={()=>setTouched(true)}
					placeholder="e.g., 123456789012"
					inputMode="numeric"
					pattern="\\d{1,12}"
					maxLength={12}
					className={`w-full px-3 py-2.5 rounded-lg border bg-white placeholder-gray-400 ${touched && !rollOk ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
				/>
				<div className="mt-1 text-xs text-gray-500">Search by roll number. Up to 12 digits.</div>
				{touched && !rollOk && (
					<div className="mt-1 text-xs text-red-600">Enter 1–12 digits.</div>
				)}
			</div>
			<button disabled={!canSubmit || loading} className={`w-full px-4 py-2.5 rounded-lg shadow-sm text-white flex items-center justify-center gap-2 ${(!canSubmit||loading)?'bg-blue-300':'bg-blue-600 hover:bg-blue-700'}`}>{loading ? 'Searching…' : '🔎 Search'}</button>
		</form>
	)
}
