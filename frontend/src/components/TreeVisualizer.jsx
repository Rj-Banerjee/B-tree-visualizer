import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'

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
		const baseX = 100
		const baseY = 140
		const depthFactor = stats.depth > 0 ? Math.max(0.6, 1.0 - (stats.depth - 3) * 0.08) : 1
		const nodeFactor = stats.nodes > 0 ? Math.max(0.6, 1.0 - (stats.nodes - 10) * 0.01) : 1
		const scaleFactor = Math.min(depthFactor, nodeFactor)
		const nodeWidth = 90 * scaleFactor
		const nodeHeight = 48 * scaleFactor
		const nodeX = baseX * scaleFactor
		const nodeY = baseY * scaleFactor
		const padding = 40
		return { nodeWidth, nodeHeight, nodeX, nodeY, padding }
	}, [stats])

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
			})
		svg.call(zoomBehaviorRef.current)
		svg.on('dblclick.zoom', null)

		if (!data || isEmpty) {
			return
		}

		const root = d3.hierarchy(data, d => d.children || [])
		const treeLayout = d3.tree().nodeSize([layoutConfig.nodeX, layoutConfig.nodeY])
		treeLayout(root)

		const activeSet = new Set(lastResult?.path || [])

		let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
		root.each((d) => {
			xMin = Math.min(xMin, d.x)
			xMax = Math.max(xMax, d.x)
			yMin = Math.min(yMin, d.y)
			yMax = Math.max(yMax, d.y)
		})
		const pad = layoutConfig.padding
		const contentWidth = (yMax - yMin) + layoutConfig.nodeWidth + pad * 2
		const contentHeight = (xMax - xMin) + layoutConfig.nodeHeight + pad * 2
		const scale = Math.min(width / contentWidth, height / contentHeight)
		const tx = (width - (yMax + layoutConfig.nodeWidth / 2 - (yMin - layoutConfig.nodeWidth / 2)) * scale) / 2
		const ty = (height - (xMax + layoutConfig.nodeHeight / 2 - (xMin - layoutConfig.nodeHeight / 2)) * scale) / 2

		svg.call(zoomBehaviorRef.current.transform, d3.zoomIdentity
			.translate(tx + (-yMin + pad) * scale, ty + (-xMin + pad) * scale)
			.scale(scale))

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
			.attr('transform', d => `translate(${d.y - layoutConfig.nodeWidth/2}, ${d.x - layoutConfig.nodeHeight/2})`)

		node.append('rect')
			.attr('rx', 12)
			.attr('ry', 12)
			.attr('width', layoutConfig.nodeWidth)
			.attr('height', layoutConfig.nodeHeight)
			.attr('fill', d => activeSet.has(d.data.nodeId) ? COLORS.active : (d.data.type === 'leaf' ? COLORS.leaf : COLORS.internal))
			.attr('opacity', 0.95)
			.attr('stroke', 'white')
			.attr('stroke-width', 1.5)

		node.append('text')
			.attr('x', layoutConfig.nodeWidth / 2)
			.attr('y', layoutConfig.nodeHeight / 2 + 3)
			.attr('text-anchor', 'middle')
			.attr('fill', 'white')
			.attr('font-size', Math.max(10, 12 * (layoutConfig.nodeWidth / 90)))
			.text(d => (d.data.keys || []).join(','))

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
		let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
		g.selectAll('g').each(function() {
			const transform = this.getAttribute('transform')
			const match = /translate\(([-0-9.]+),\s*([-0-9.]+)\)/.exec(transform)
			if (match) {
				const ty = parseFloat(match[1])
				const tx = parseFloat(match[2])
				yMin = Math.min(yMin, ty)
				yMax = Math.max(yMax, ty)
				xMin = Math.min(xMin, tx)
				xMax = Math.max(xMax, tx)
			}
		})
		const pad = layoutConfig.padding
		const contentWidth = (yMax - yMin) + layoutConfig.nodeWidth + pad * 2
		const contentHeight = (xMax - xMin) + layoutConfig.nodeHeight + pad * 2
		const scale = Math.min(width / contentWidth, height / contentHeight)
		const tx = (width - (yMax - yMin + layoutConfig.nodeWidth) * scale) / 2 - yMin * scale + pad * scale
		const ty = (height - (xMax - xMin + layoutConfig.nodeHeight) * scale) / 2 - xMin * scale + pad * scale
		svg.transition().duration(200).call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(scale))
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
