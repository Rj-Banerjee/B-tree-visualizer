import React from 'react'

export default function Header() {
	return (
		<header className="bg-white border-b border-gray-200">
			<div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
				<svg className="h-9 w-9 text-blue-600" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="36" r="6" fill="currentColor" opacity="0.25" />
					<circle cx="36" cy="36" r="6" fill="currentColor" opacity="0.25" />
					<circle cx="24" cy="12" r="6" fill="currentColor" />
					<path d="M24 18 L12 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
					<path d="M24 18 L36 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
				</svg>
				<div className="text-lg font-semibold text-gray-900">B* Tree Visualizer</div>
			</div>
		</header>
	)
}
