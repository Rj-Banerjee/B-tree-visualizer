import React from 'react'

export default function ApplicationScenario() {
	return (
		<div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200">
			<h2 className="text-lg font-semibold text-gray-900 mb-3">Application Scenario</h2>
			<div className="space-y-4 text-sm text-gray-700">
				<div>
					<div className="font-medium text-gray-900 mb-1">Database Index</div>
					<ul className="list-disc pl-5 space-y-1">
						<li>Roll numbers indexed using B* Tree</li>
						<li>Balanced structure for consistent performance</li>
						<li>Supports insert, search, and delete</li>
					</ul>
				</div>
				<div>
					<div className="font-medium text-gray-900 mb-1">Key Features</div>
					<ul className="list-disc pl-5 space-y-1">
						<li>Live visualization with path highlight</li>
						<li>Split, borrow, and merge animations</li>
						<li>Operation metrics in real time</li>
					</ul>
				</div>
				<div>
					<div className="font-medium text-gray-900 mb-1">Performance</div>
					<ul className="list-disc pl-5 space-y-1">
						<li>O(log n) search complexity</li>
						<li>Shallow height, high node utilization</li>
						<li>Predictable update costs</li>
					</ul>
				</div>

				{/* Color Index */}
				<div className="rounded-xl border border-gray-200 p-3 bg-white">
					<div className="font-medium text-gray-900 mb-2">Color Index</div>
					<ul className="space-y-2">
						<li className="flex items-center gap-2">
							<span className="inline-block h-3.5 w-3.5 rounded-full bg-blue-600" />
							<span>Root Node / Internal Node</span>
						</li>
						<li className="flex items-center gap-2">
							<span className="inline-block h-3.5 w-3.5 rounded-full bg-green-600" />
							<span>Leaf Node</span>
						</li>
						<li className="flex items-center gap-2">
							<span className="inline-block h-3.5 w-3.5 rounded-full bg-orange-500" />
							<span>Active Traversal Path</span>
						</li>
					</ul>
				</div>

				<div>
					<a href="https://en.wikipedia.org/wiki/B*_tree" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Learn more about B* Trees</a>
				</div>
			</div>
		</div>
	)
}
