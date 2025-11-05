/*
 B* Tree implementation (approximation via B-Tree with redistribution and merges)
 - Keys: roll numbers (numbers)
 - Values not stored; only keys are indexed. Actual records live in records.json
 - Public API: insert(key), search(key), delete(key), getTree(), reset()
 - Internal ops: split, merge, redistribute (borrow from siblings)
 - Tracks comparisons and traversal path with unique nodeIds for visualization
*/

let NEXT_NODE_ID = 1

class OperationStats {
	constructor() {
		this.comparisons = 0
		this.path = []
	}
	compare(a, b) {
		this.comparisons += 1
		return a - b
	}
	visit(node) {
		this.path.push(node.nodeId)
	}
}

class Node {
	constructor(leaf = true) {
		this.leaf = leaf
		this.keys = []
		this.children = []
		this.nodeId = NEXT_NODE_ID++
	}
}

class BStarTree {
	constructor(minDegree = 3) {
		this.t = Math.max(2, minDegree)
		this.root = new Node(true)
	}

	reset() {
		this.root = new Node(true)
	}

	search(key) {
		const stats = new OperationStats()
		const result = this._searchNode(this.root, key, stats)
		return { found: !!result, comparisons: stats.comparisons, meta: { path: stats.path } }
	}

	_searchNode(node, key, stats) {
		stats.visit(node)
		let i = 0
		while (i < node.keys.length && stats.compare(node.keys[i], key) < 0) i++
		if (i < node.keys.length && node.keys[i] === key) return { node, index: i }
		if (node.leaf) return null
		return this._searchNode(node.children[i], key, stats)
	}

	insert(key) {
		// Prevent duplicates by early search
		const pre = this.search(key)
		if (pre.found) {
			return { inserted: false, comparisons: pre.comparisons, meta: { path: pre.meta.path } }
		}

		const stats = new OperationStats()
		if (this.root.keys.length === 2 * this.t - 1) {
			const s = new Node(false)
			s.children.push(this.root)
			this._splitChild(s, 0)
			this.root = s
		}
		this._insertNonFull(this.root, key, stats)
		return { inserted: true, comparisons: stats.comparisons + pre.comparisons, meta: { path: [...pre.meta.path, ...stats.path] } }
	}

	_insertNonFull(node, key, stats) {
		stats.visit(node)
		let i = node.keys.length - 1
		if (node.leaf) {
			while (i >= 0 && stats.compare(node.keys[i], key) > 0) {
				node.keys[i + 1] = node.keys[i]
				i--
			}
			if (i >= 0 && node.keys[i] === key) return
			node.keys[i + 1] = key
		} else {
			while (i >= 0 && stats.compare(node.keys[i], key) > 0) i--
			if (i >= 0 && node.keys[i] === key) return
			i++
			if (node.children[i].keys.length === 2 * this.t - 1) {
				if (i > 0 && node.children[i - 1].keys.length < 2 * this.t - 1) {
					this._borrowFromPrev(node, i)
				} else if (i + 1 < node.children.length && node.children[i + 1].keys.length < 2 * this.t - 1) {
					this._borrowFromNext(node, i)
				} else {
					this._splitChild(node, i)
					if (stats.compare(node.keys[i], key) < 0) i++
				}
			}
			this._insertNonFull(node.children[i], key, stats)
		}
	}

	_splitChild(parent, i) {
		const t = this.t
		const y = parent.children[i]
		const z = new Node(y.leaf)
		const median = y.keys[t - 1]
		for (let j = 0; j < t - 1; j++) z.keys[j] = y.keys[j + t]
		if (!y.leaf) {
			for (let j = 0; j < t; j++) z.children[j] = y.children[j + t]
			y.children = y.children.slice(0, t)
		}
		y.keys = y.keys.slice(0, t - 1)
		parent.children.splice(i + 1, 0, z)
		parent.keys.splice(i, 0, median)
	}

	_borrowFromPrev(parent, i) {
		const child = parent.children[i]
		const left = parent.children[i - 1]
		child.keys.unshift(parent.keys[i - 1])
		if (!child.leaf) child.children.unshift(left.children.pop())
		parent.keys[i - 1] = left.keys.pop()
	}

	_borrowFromNext(parent, i) {
		const child = parent.children[i]
		const right = parent.children[i + 1]
		child.keys.push(parent.keys[i])
		if (!child.leaf) child.children.push(right.children.shift())
		parent.keys[i] = right.keys.shift()
	}

	_mergeChildren(parent, i) {
		const child = parent.children[i]
		const right = parent.children[i + 1]
		child.keys.push(parent.keys[i])
		child.keys = child.keys.concat(right.keys)
		if (!child.leaf) child.children = child.children.concat(right.children)
		parent.keys.splice(i, 1)
		parent.children.splice(i + 1, 1)
	}

	delete(key) {
		const stats = new OperationStats()
		const deleted = this._deleteInternal(this.root, key, stats)
		if (!this.root.leaf && this.root.keys.length === 0) {
			this.root = this.root.children[0]
		}
		return { deleted: !!deleted, comparisons: stats.comparisons, meta: { removedKey: deleted ? key : null, path: stats.path } }
	}

	_deleteInternal(node, key, stats) {
		stats.visit(node)
		const t = this.t
		let idx = 0
		while (idx < node.keys.length && stats.compare(node.keys[idx], key) < 0) idx++

		if (idx < node.keys.length && node.keys[idx] === key) {
			if (node.leaf) {
				node.keys.splice(idx, 1)
				return true
			}
			if (node.children[idx].keys.length >= t) {
				const pred = this._getPredecessor(node.children[idx])
				node.keys[idx] = pred
				return this._deleteInternal(node.children[idx], pred, stats)
			} else if (node.children[idx + 1].keys.length >= t) {
				const succ = this._getSuccessor(node.children[idx + 1])
				node.keys[idx] = succ
				return this._deleteInternal(node.children[idx + 1], succ, stats)
			} else {
				this._mergeChildren(node, idx)
				return this._deleteInternal(node.children[idx], key, stats)
			}
		}

		if (node.leaf) return false
		let child = node.children[idx]
		if (child.keys.length === t - 1) {
			if (idx > 0 && node.children[idx - 1].keys.length >= t) this._borrowFromPrev(node, idx)
			else if (idx < node.children.length - 1 && node.children[idx + 1].keys.length >= t) this._borrowFromNext(node, idx)
			else {
				if (idx < node.children.length - 1) this._mergeChildren(node, idx)
				else { this._mergeChildren(node, idx - 1); idx = idx - 1 }
			}
			child = node.children[idx]
		}
		return this._deleteInternal(child, key, stats)
	}

	_getPredecessor(node) {
		while (!node.leaf) node = node.children[node.children.length - 1]
		return node.keys[node.keys.length - 1]
	}
	_getSuccessor(node) {
		while (!node.leaf) node = node.children[0]
		return node.keys[0]
	}

	getTree() {
		const info = { nodes: 0, height: 0, keys: 0 }
		const tree = this._toSerializable(this.root, 1, info)
		return { tree, height: info.height, nodeCount: info.nodes, keyCount: info.keys }
	}

	_toSerializable(node, depth, info) {
		info.nodes += 1
		info.height = Math.max(info.height, depth)
		info.keys += node.keys.length
		const out = {
			nodeId: node.nodeId,
			type: node.leaf ? 'leaf' : 'internal',
			keys: [...node.keys],
			children: [],
		}
		if (!node.leaf) {
			for (const c of node.children) out.children.push(this._toSerializable(c, depth + 1, info))
		}
		return out
	}
}

module.exports = { BStarTree }
