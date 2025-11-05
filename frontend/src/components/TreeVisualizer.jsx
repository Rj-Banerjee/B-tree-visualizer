import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { annotateTreeWithSizes, getTreeSeparation, scaleDepthY, computeBoundsFromNodes } from '../utils/visualLayout'

const COLORS = {
	leaf: '#22c55e',
	internal: '#3b82f6',
	active: '#f59e0b',
	removed: '#ef4444',
}

export default function TreeVisualizer({ data, lastResult }) {
	const containerRef = useRef(null)
	const svgRef = useRef(null)
	const gRef = useRef(null)
	const zoomBehaviorRef = useRef(null)
	const resizeObserverRef = useRef(null)
	const currentTransformRef = useRef(d3.zoomIdentity)
	const hasUserInteractedRef = useRef(false)
	const [containerSize, setContainerSize] = useState({ width: 800, height: 420 })

	const isEmpty = useMemo(() => {
		if (!data) return true
		const hasKeys = Array.isArray(data.keys) && data.keys.length > 0
		const hasChildren = Array.isArray(data.children) && data.children.length > 0
		return !(hasKeys || hasChildren)
	}, [data])

	const stats = useMemo(() => {
		if (!data || isEmpty) return { depth: 0, nodes: 0 }
		let maxDepth = 0
		let nodes = 0
		const walk = (n, d) => {
			nodes += 1
			maxDepth = Math.max(maxDepth, d)
			if (n.children) n.children.forEach(c => walk(c, d + 1))
		}
		walk(data, 1)
		return { depth: maxDepth, nodes }
	}, [data, isEmpty])

	const layoutConfig = useMemo(() => {
		const baseStepX = 90
		const baseStepY = 140
		const padding = 60
		return { baseStepX, baseStepY, padding }
	}, [])

	useEffect(() => {
		if (!containerRef.current) return
		if (resizeObserverRef.current) resizeObserverRef.current.disconnect()
		resizeObserverRef.current = new ResizeObserver(entries => {
			for (const entry of entries) {
				const cr = entry.contentRect
				setContainerSize({ width: cr.width, height: Math.max(360, cr.height) })
			}
		})
		resizeObserverRef.current.observe(containerRef.current)
		return () => resizeObserverRef.current?.disconnect()
	}, [])

	useEffect(() => {
		const svg = d3.select(svgRef.current)
		svg.selectAll('*').remove()
		const width = containerSize.width
		const height = Math.max(360, containerSize.height)
		svg.attr('width', width).attr('height', height)

		// Setup zoom behavior even if empty so controls still work later
		const g = svg.append('g')
		gRef.current = g
		zoomBehaviorRef.current = d3.zoom()
			.scaleExtent([0.2, 2.5])
			.on('zoom', (event) => {
				g.attr('transform', event.transform)
				currentTransformRef.current = event.transform
				hasUserInteractedRef.current = true
			})
		svg.call(zoomBehaviorRef.current)
		svg.on('dblclick.zoom', null)

		if (!data || isEmpty) {
			return
		}

		// Annotate data with per-node sizes based on key text
		const sizedData = annotateTreeWithSizes(JSON.parse(JSON.stringify(data)))
		const root = d3.hierarchy(sizedData, d => d.children || [])
		const separation = getTreeSeparation(100)
		const approxHeight = Math.max(1, stats.depth) * layoutConfig.baseStepX * 1.4
		const approxWidth = Math.max(1, stats.nodes) * layoutConfig.baseStepY
		const treeLayout = d3.tree().size([approxHeight, approxWidth]).separation(separation)
		treeLayout(root)
		// Scale Y by depth to give more room deeper in the tree
		root.each(d => { d.y = scaleDepthY(d.y, d.depth, 0.14) })

		const activeSet = new Set(lastResult?.path || [])

		const bounds = computeBoundsFromNodes(root.descendants(), layoutConfig.padding)
		const contentWidth = bounds.width
		const contentHeight = bounds.height
		const scale = Math.min(width / contentWidth, height / contentHeight)
		const tx = (width - (bounds.yMax - bounds.yMin) * scale) / 2 - bounds.yMin * scale
		const ty = (height - (bounds.xMax - bounds.xMin) * scale) / 2 - bounds.xMin * scale
		// Preserve user zoom; only auto-fit if user hasn't interacted yet
		if (hasUserInteractedRef.current) {
			svg.call(zoomBehaviorRef.current.transform, currentTransformRef.current)
		} else {
			const fitTransform = d3.zoomIdentity.translate(tx, ty).scale(scale)
			currentTransformRef.current = fitTransform
			svg.call(zoomBehaviorRef.current.transform, fitTransform)
		}

		g.append('g')
			.selectAll('path')
			.data(root.links())
			.join('path')
			.attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x))
			.attr('stroke', '#CBD5E1')
			.attr('fill', 'none')

		const node = g.append('g')
			.selectAll('g')
			.data(root.descendants())
			.join('g')
			.attr('transform', d => {
				const w = d.data?._viz?.nodeWidth ?? 90
				const h = d.data?._viz?.nodeHeight ?? 48
				return `translate(${d.y - w/2}, ${d.x - h/2})`
			})

		node.append('rect')
			.attr('rx', 12)
			.attr('ry', 12)
			.attr('width', d => d.data?._viz?.nodeWidth ?? 90)
			.attr('height', d => d.data?._viz?.nodeHeight ?? 48)
			.attr('fill', d => activeSet.has(d.data.nodeId) ? COLORS.active : (d.data.type === 'leaf' ? COLORS.leaf : COLORS.internal))
			.attr('opacity', 0.95)
			.attr('stroke', 'white')
			.attr('stroke-width', 1.5)

		node.append('text')
			.attr('x', d => (d.data?._viz?.nodeWidth ?? 90) / 2)
			.attr('y', d => (d.data?._viz?.nodeHeight ?? 48) / 2 + 3)
			.attr('text-anchor', 'middle')
			.attr('fill', 'white')
			.attr('font-size', d => d.data?._viz?.fontSize ?? 12)
			.text(d => d.data?._viz?.text ?? (d.data.keys || []).join(','))

		if (lastResult?.meta?.removedKey != null) {
			g.append('text')
				.attr('x', (yMax + yMin) / 2)
				.attr('y', xMin - pad)
				.attr('text-anchor', 'middle')
				.attr('fill', COLORS.removed)
				.attr('font-weight', 600)
				.text(`Deleted: ${lastResult.meta.removedKey}`)
				.transition().duration(1200).style('opacity', 0).remove()
		}
	}, [data, lastResult, containerSize, layoutConfig, isEmpty])

	const handleZoomIn = () => {
		const svg = d3.select(svgRef.current)
		svg.transition().duration(200).call(zoomBehaviorRef.current.scaleBy, 1.2)
	}
	const handleZoomOut = () => {
		const svg = d3.select(svgRef.current)
		svg.transition().duration(200).call(zoomBehaviorRef.current.scaleBy, 1/1.2)
	}
	const handleFit = () => {
		if (!data || isEmpty) return
		const svg = d3.select(svgRef.current)
		const g = gRef.current
		if (!g) return
		const width = containerSize.width
		const height = Math.max(360, containerSize.height)
		// Recompute using data-aware bounds
		const nodes = []
		g.selectAll('g').each(function(d) { if (d) nodes.push(d) })
		const bounds = computeBoundsFromNodes(nodes, layoutConfig.padding)
		const contentWidth = bounds.width
		const contentHeight = bounds.height
		const scale = Math.min(width / contentWidth, height / contentHeight)
		const tx = (width - (bounds.yMax - bounds.yMin) * scale) / 2 - bounds.yMin * scale
		const ty = (height - (bounds.xMax - bounds.xMin) * scale) / 2 - bounds.xMin * scale
		const fitTransform = d3.zoomIdentity.translate(tx, ty).scale(scale)
		currentTransformRef.current = fitTransform
		hasUserInteractedRef.current = true
		svg.transition().duration(200).call(zoomBehaviorRef.current.transform, fitTransform)
	}

	return (
		<div ref={containerRef} className="w-full">
			<div className="text-center mb-3">
				<div className="text-lg font-semibold">B* Tree Visualization</div>
				<div className="text-gray-600 text-sm">Watch how the structure evolves with each operation</div>
			</div>
			<div className="relative">
				{isEmpty ? (
					<div className="w-full h-[420px] flex items-center justify-center text-gray-600">No data yet</div>
				) : (
					<svg ref={svgRef} className="w-full h-[420px]" />
				)}
				<div className="absolute right-3 top-3 flex flex-col gap-2">
					<button onClick={handleZoomIn} className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-700">+</button>
					<button onClick={handleZoomOut} className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-700">-</button>
					<button onClick={handleFit} className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-700">⤢</button>
				</div>
			</div>
		</div>
	)
}
