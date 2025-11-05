// Utilities for computing dynamic node sizes, text scaling, and tree spacing

const DEFAULTS = {
	paddingX: 14,
	paddingY: 10,
	minFontSize: 10,
	maxFontSize: 14,
	minNodeWidth: 72,
	maxNodeWidth: 420,
	baseCharWidth: 8.2, // px per character for default font approximation
	commaSeparator: ', ',
}

export function computeTextWidthApprox(text, fontSize = 12, baseCharWidth = DEFAULTS.baseCharWidth) {
	if (!text) return 0
	const avg = baseCharWidth * (fontSize / 12)
	return text.length * avg
}

export function computeNodeSizeForKeys(keys, opts = {}) {
	const {
		paddingX = DEFAULTS.paddingX,
		paddingY = DEFAULTS.paddingY,
		minFontSize = DEFAULTS.minFontSize,
		maxFontSize = DEFAULTS.maxFontSize,
		minNodeWidth = DEFAULTS.minNodeWidth,
		maxNodeWidth = DEFAULTS.maxNodeWidth,
		commaSeparator = DEFAULTS.commaSeparator,
	} = opts

	const text = Array.isArray(keys) ? keys.join(commaSeparator) : ''
	// Start with optimistic font then shrink if needed
	let fontSize = maxFontSize
	let textWidth = computeTextWidthApprox(text, fontSize)
	let nodeWidth = Math.max(minNodeWidth, Math.min(maxNodeWidth, textWidth + paddingX * 2))

	// If text overflows max width, reduce font size down to min
	while (textWidth + paddingX * 2 > nodeWidth && fontSize > minFontSize) {
		fontSize -= 0.5
		textWidth = computeTextWidthApprox(text, fontSize)
		nodeWidth = Math.max(minNodeWidth, Math.min(maxNodeWidth, textWidth + paddingX * 2))
	}

	const nodeHeight = Math.max(40, Math.ceil(fontSize * 2.6) + paddingY * 2)

	return { nodeWidth, nodeHeight, fontSize, text }
}

export function annotateTreeWithSizes(rootData, opts = {}) {
	const walk = (n) => {
		const { nodeWidth, nodeHeight, fontSize, text } = computeNodeSizeForKeys(n.keys, opts)
		n._viz = { nodeWidth, nodeHeight, fontSize, text }
		if (Array.isArray(n.children)) n.children.forEach(walk)
	}
	if (rootData) walk(rootData)
	return rootData
}

export function getTreeSeparation(baseWidth = 90) {
	// Separation increases with node widths and if nodes are not siblings
	return (a, b) => {
		const aw = a.data?._viz?.nodeWidth ?? baseWidth
		const bw = b.data?._viz?.nodeWidth ?? baseWidth
		const siblingFactor = a.parent === b.parent ? 1.0 : 1.4
		const widthFactor = (aw + bw) / (2 * baseWidth)
		return 0.8 * siblingFactor * Math.max(0.6, widthFactor)
	}
}

export function scaleDepthY(y, depth, perDepthFactor = 0.12) {
	return y * (1 + depth * perDepthFactor)
}

export function computeBoundsFromNodes(nodes, pad = 40) {
	let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
	for (const d of nodes) {
		const w = d.data?._viz?.nodeWidth ?? 90
		const h = d.data?._viz?.nodeHeight ?? 48
		const x0 = d.x - h / 2
		const x1 = d.x + h / 2
		const y0 = d.y - w / 2
		const y1 = d.y + w / 2
		xMin = Math.min(xMin, x0)
		xMax = Math.max(xMax, x1)
		yMin = Math.min(yMin, y0)
		yMax = Math.max(yMax, y1)
	}
	return {
		xMin: xMin - pad,
		xMax: xMax + pad,
		yMin: yMin - pad,
		yMax: yMax + pad,
		width: yMax - yMin + pad * 2,
		height: xMax - xMin + pad * 2,
	}
}


