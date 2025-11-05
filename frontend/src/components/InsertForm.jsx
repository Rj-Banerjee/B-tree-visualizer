import React, { useState } from 'react'
import { api } from '../utils/api'

export default function InsertForm({ onDone }) {
	const [rollNo, setRollNo] = useState('')
	const [name, setName] = useState('')
	const [department, setDepartment] = useState('')
	const [loading, setLoading] = useState(false)
	const [touched, setTouched] = useState({ rollNo: false, name: false, department: false })

	const rollOk = /^\d{1,12}$/.test(rollNo)
	const nameOk = name.trim().length >= 2
	const deptOk = department.trim().length >= 2
	const canSubmit = rollOk && nameOk && deptOk

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
		<form onSubmit={submit} className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Roll number</label>
				<input
					value={rollNo}
					onChange={e=>setRollNo(e.target.value.replace(/\D+/g,''))}
					onBlur={()=>setTouched(v=>({ ...v, rollNo: true }))}
					placeholder="e.g., 123456789012"
					inputMode="numeric"
					pattern="\\d{1,12}"
					maxLength={12}
					className={`w-full px-3 py-2.5 rounded-lg border bg-white placeholder-gray-400 ${touched.rollNo && !rollOk ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
				/>
				<div className="mt-1 text-xs text-gray-500">Up to 12 digits. Large keys supported.</div>
				{touched.rollNo && !rollOk && (
					<div className="mt-1 text-xs text-red-600">Enter 1–12 digits.</div>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
				<input
					value={name}
					onChange={e=>setName(e.target.value)}
					onBlur={()=>setTouched(v=>({ ...v, name: true }))}
					placeholder="e.g., Jane Doe"
					className={`w-full px-3 py-2.5 rounded-lg border bg-white placeholder-gray-400 ${touched.name && !nameOk ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
				/>
				{touched.name && !nameOk && (
					<div className="mt-1 text-xs text-red-600">Please enter at least 2 characters.</div>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
				<input
					value={department}
					onChange={e=>setDepartment(e.target.value)}
					onBlur={()=>setTouched(v=>({ ...v, department: true }))}
					placeholder="e.g., Computer Science"
					className={`w-full px-3 py-2.5 rounded-lg border bg-white placeholder-gray-400 ${touched.department && !deptOk ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
				/>
				{touched.department && !deptOk && (
					<div className="mt-1 text-xs text-red-600">Please enter at least 2 characters.</div>
				)}
			</div>

			<button
				disabled={!canSubmit || loading}
				className={`w-full px-4 py-2.5 rounded-lg shadow-sm text-white flex items-center justify-center gap-2 ${(!canSubmit||loading)?'bg-blue-300':'bg-blue-600 hover:bg-blue-700'}`}
			>
				{loading ? 'Inserting…' : '➕ Insert Student'}
			</button>
		</form>
	)
}
