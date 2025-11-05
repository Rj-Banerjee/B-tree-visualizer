import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { api } from './utils/api'
import TreeVisualizer from './components/TreeVisualizer'
import MetricsPanel from './components/MetricsPanel'
import InsertForm from './components/InsertForm'
import SearchForm from './components/SearchForm'
import DeleteForm from './components/DeleteForm'
import ResultCard from './components/ResultCard'
import Header from './components/Header'
import ApplicationScenario from './components/ApplicationScenario'

function App() {
	const [tree, setTree] = useState(null)
	const [metrics, setMetrics] = useState({})
	const [result, setResult] = useState(null)
	const [tab, setTab] = useState('insert')
	const [opCounts, setOpCounts] = useState({ inserts: 0, deletes: 0, searches: 0 })
	const [error, setError] = useState(false)

	const loadTree = async () => {
		setError(false)
		try {
			const t = await api.getTree()
			setTree(t)
		} catch (e) {
			console.error(e)
			setError(true)
		}
	}

	useEffect(() => {
		loadTree()
	}, [])

	const handleInserted = (payload) => {
		setTree({ tree: payload.tree, height: payload.height, nodeCount: payload.nodeCount, keyCount: payload.keyCount, complexity: payload.complexity })
		setMetrics(payload.metrics)
		setOpCounts(c => ({ ...c, inserts: c.inserts + 1 }))
	}
	const handleDeleted = (payload) => {
		setTree({ tree: payload.tree, height: payload.height, nodeCount: payload.nodeCount, keyCount: payload.keyCount, complexity: payload.complexity })
		setMetrics(payload.metrics)
		setOpCounts(c => ({ ...c, deletes: c.deletes + 1 }))
	}
	const handleSearched = (payload) => {
		setResult(payload)
		setMetrics(payload.metrics)
		setOpCounts(c => ({ ...c, searches: c.searches + 1 }))
	}
	const handleReset = async () => {
		const r = await api.reset()
		setTree(r)
		setResult(null)
		setMetrics({})
		setOpCounts({ inserts: 0, deletes: 0, searches: 0 })
	}

	return (
		<div className="min-h-screen bg-[#F3F6FB] text-gray-900">
			<Header />

			<section className="max-w-6xl mx-auto px-4 pt-8 pb-4 text-center">
				<h1 className="text-2xl font-bold">B* Tree Student Database</h1>
				<p className="text-gray-600 mt-1">Interactive visualization of a B* Tree data structure for student records</p>
			</section>

			<main className="max-w-6xl mx-auto px-4 pb-10 grid lg:grid-cols-3 gap-6">
				{/* Left: Application Scenario */}
				<div className="lg:col-span-1">
					<ApplicationScenario />
				</div>

				{/* Center: Tree visualization */}
				<section className="lg:col-span-1">
					<div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 min-h-[420px] flex items-center justify-center">
						{error ? (
							<div className="text-center">
								<div className="text-gray-600 mb-3">Error loading tree data</div>
								<button onClick={loadTree} className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow-sm">Retry</button>
							</div>
						) : (
							<div className="w-full">
								<TreeVisualizer data={tree?.tree} lastResult={result} />
							</div>
						)}
					</div>
					{result && (
						<div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 mt-4">
							<ResultCard result={result} />
						</div>
					)}
				</section>

				{/* Right: Tabs + Metrics */}
				<aside className="lg:col-span-1 space-y-4">
					<div className="bg-white rounded-2xl shadow-sm border border-gray-200">
						<div className="px-4 pt-4">
							<div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
								<button onClick={()=>setTab('insert')} className={`px-3 py-1.5 text-sm rounded-md ${tab==='insert'?'bg-white shadow-sm text-gray-900':'text-gray-600'}`}>Insert</button>
								<button onClick={()=>setTab('delete')} className={`px-3 py-1.5 text-sm rounded-md ${tab==='delete'?'bg-white shadow-sm text-gray-900':'text-gray-600'}`}>Delete</button>
								<button onClick={()=>setTab('search')} className={`px-3 py-1.5 text-sm rounded-md ${tab==='search'?'bg-white shadow-sm text-gray-900':'text-gray-600'}`}>Search</button>
							</div>
						</div>
						<div className="p-4">
							{tab==='insert' && <InsertForm onDone={handleInserted} />}
							{tab==='delete' && <DeleteForm onDone={handleDeleted} />}
							{tab==='search' && <SearchForm onDone={handleSearched} />}
							<div className="mt-3 flex items-center justify-between">
								<button onClick={handleReset} className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-sm">Reset Tree</button>
								<span className="text-xs text-gray-500">Keep API connections intact</span>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
						<MetricsPanel tree={tree} metrics={metrics} opCounts={opCounts} />
					</div>
				</aside>
			</main>
		</div>
	)
}

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)

export default App
