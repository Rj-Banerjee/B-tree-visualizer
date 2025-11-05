import React, { useState } from 'react'
import { api } from '../utils/api'

export default function InsertForm({ onDone }) {
	const [rollNo, setRollNo] = useState('')
	const [name, setName] = useState('')
	const [department, setDepartment] = useState('')
	const [loading, setLoading] = useState(false)

	const canSubmit = rollNo && name && department

	const submit = async (e) => {
		e.preventDefault()
		if (!canSubmit) return
		setLoading(true)
		try {
			const payload = { rollNo: Number(rollNo), name, department }
			const res = await api.insert(payload)
			onDone(res)
			setRollNo('')
			setName('')
			setDepartment('')
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={submit} className="space-y-3">
			<input value={rollNo} onChange={e=>setRollNo(e.target.value)} placeholder="Roll number" type="number" className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white placeholder-gray-400" />
			<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white placeholder-gray-400" />
			<input value={department} onChange={e=>setDepartment(e.target.value)} placeholder="Department" className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white placeholder-gray-400" />
			<button disabled={!canSubmit || loading} className={`w-full px-4 py-2.5 rounded-lg shadow-sm text-white ${(!canSubmit||loading)?'bg-blue-300':'bg-blue-600 hover:bg-blue-700'}`}>{loading ? 'Inserting...' : '+ Insert Student'}</button>
		</form>
	)
}
