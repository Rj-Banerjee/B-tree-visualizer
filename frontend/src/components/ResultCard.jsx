import React from 'react'

export default function ResultCard({ result }) {
	if (!result) return null
	return (
		<div>
			<h3 className="font-medium mb-2">Search Result</h3>
			{result.found && result.record ? (
				<div className="rounded-md border border-emerald-300/50 bg-emerald-50 dark:bg-emerald-900/30 p-3 text-sm">
					<div><span className="text-gray-500 dark:text-gray-400">Roll No:</span> <span className="font-medium">{result.record.rollNo}</span></div>
					<div><span className="text-gray-500 dark:text-gray-400">Name:</span> <span className="font-medium">{result.record.name}</span></div>
					<div><span className="text-gray-500 dark:text-gray-400">Department:</span> <span className="font-medium">{result.record.department}</span></div>
				</div>
			) : (
				<div className="rounded-md border border-rose-300/50 bg-rose-50 dark:bg-rose-900/30 p-3 text-sm">Not found</div>
			)}
		</div>
	)
}
