import React from 'react'

export default function MetricsPanel({ tree, metrics, opCounts }) {
	const height = tree?.height ?? 0
	const nodeCount = tree?.nodeCount ?? 0
	const keyCount = tree?.keyCount ?? 0
	const complexity = tree?.complexity ?? 0
	// Approximate load factor with max 5 keys per node (t=3 => 2t-1=5)
	const maxPerNode = 5
	const loadFactor = nodeCount > 0 ? Math.min(100, (keyCount / (nodeCount * maxPerNode)) * 100) : 0
	const timeMs = typeof metrics?.timeMs === 'number' ? metrics.timeMs.toFixed(2) : '-'

	return (
		<div>
			<div className="flex items-center gap-2 mb-3">
				<div className="h-7 w-7 rounded-md bg-blue-600 text-white flex items-center justify-center text-sm">⏱</div>
				<h2 className="text-base font-semibold">Performance Metrics</h2>
			</div>

			<div className="grid grid-cols-2 gap-3 text-sm">
				<div className="rounded-xl border border-gray-200 p-3 bg-white">
					<div className="text-gray-500">Tree Height</div>
					<div className="text-lg font-semibold">{height}</div>
				</div>
				<div className="rounded-xl border border-gray-200 p-3 bg-white">
					<div className="text-gray-500">Total Nodes</div>
					<div className="text-lg font-semibold">{nodeCount}</div>
				</div>
				<div className="rounded-xl border border-gray-200 p-3 bg-white">
					<div className="text-gray-500">Total Students</div>
					<div className="text-lg font-semibold">{keyCount}</div>
				</div>
				<div className="rounded-xl border border-gray-200 p-3 bg-white">
					<div className="text-gray-500">Load Factor</div>
					<div className="text-lg font-semibold">{loadFactor.toFixed(0)}%</div>
				</div>
			</div>

			<div className="mt-4 grid grid-cols-3 gap-3 text-sm">
				<div className="rounded-xl border border-gray-200 p-3 bg-white">
					<div className="text-gray-500">Inserts</div>
					<div className="text-lg font-semibold">{opCounts?.inserts ?? 0}</div>
				</div>
				<div className="rounded-xl border border-gray-200 p-3 bg-white">
					<div className="text-gray-500">Deletes</div>
					<div className="text-lg font-semibold">{opCounts?.deletes ?? 0}</div>
				</div>
				<div className="rounded-xl border border-gray-200 p-3 bg-white">
					<div className="text-gray-500">Searches</div>
					<div className="text-lg font-semibold">{opCounts?.searches ?? 0}</div>
				</div>
			</div>

			<div className="mt-4 flex items-center gap-2 text-sm">
				<div className="h-6 w-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">⚡</div>
				<div className="text-gray-600">Last Operation Time:</div>
				<div className="font-medium">{timeMs} ms</div>
				<div className="ml-auto text-gray-500">log2(n): {complexity.toFixed(2)}</div>
			</div>
		</div>
	)
}
