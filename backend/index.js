const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { withTimer } = require('./utils/timer');
const { BStarTree } = require('./bstarTree');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const DATA_PATH = path.join(__dirname, 'records.json');

// In-memory tree and record map
const tree = new BStarTree();
let records = [];

function loadRecords() {
	try {
		const raw = fs.readFileSync(DATA_PATH, 'utf-8');
		records = JSON.parse(raw);
		// Rebuild tree from records (keys are rollNo)
		tree.reset();
		for (const r of records) {
			if (typeof r.rollNo === 'number') {
				tree.insert(r.rollNo, { rollNo: r.rollNo });
			}
		}
	} catch (e) {
		records = [];
		fs.writeFileSync(DATA_PATH, JSON.stringify(records, null, 2));
	}
}

function persistRecords() {
	fs.writeFileSync(DATA_PATH, JSON.stringify(records, null, 2));
}

loadRecords();

app.get('/api/getTree', (req, res) => {
	const { tree: structure, height, nodeCount, keyCount } = tree.getTree();
	const complexity = Math.log2(Math.max(1, keyCount));
	return res.json({ tree: structure, height, nodeCount, keyCount, complexity });
});

app.post('/api/insert', (req, res) => {
	const { rollNo, name, department } = req.body || {};
	if (typeof rollNo !== 'number' || !name || !department) {
		return res.status(400).json({ error: 'rollNo (number), name, department required' });
	}

	const { result, elapsedMs, comparisons, meta } = withTimer(() => tree.insert(rollNo, { rollNo }));

	// Upsert record
	const idx = records.findIndex(r => r.rollNo === rollNo);
	if (idx >= 0) records[idx] = { rollNo, name, department };
	else records.push({ rollNo, name, department });
	persistRecords();

	const t = tree.getTree();
	return res.json({
		ok: true,
		tree: t.tree,
		height: t.height,
		nodeCount: t.nodeCount,
		keyCount: t.keyCount,
		complexity: Math.log2(Math.max(1, t.keyCount)),
		metrics: { timeMs: elapsedMs, comparisons },
		path: meta?.path || []
	});
});

app.get('/api/search/:rollNo', (req, res) => {
	const rollNo = Number(req.params.rollNo);
	if (!Number.isFinite(rollNo)) {
		return res.status(400).json({ error: 'Invalid rollNo' });
	}
	const { result, elapsedMs, comparisons, meta } = withTimer(() => tree.search(rollNo));
	const record = records.find(r => r.rollNo === rollNo) || null;
	return res.json({
		record,
		found: !!result?.found,
		path: meta?.path || [],
		metrics: { timeMs: elapsedMs, comparisons }
	});
});

app.delete('/api/delete/:rollNo', (req, res) => {
	const rollNo = Number(req.params.rollNo);
	if (!Number.isFinite(rollNo)) {
		return res.status(400).json({ error: 'Invalid rollNo' });
	}
	const { result, elapsedMs, comparisons, meta } = withTimer(() => tree.delete(rollNo));
	// Remove from records if delete succeeded
	if (result?.deleted) {
		records = records.filter(r => r.rollNo !== rollNo);
		persistRecords();
	}
	const t = tree.getTree();
	return res.json({
		ok: !!result?.deleted,
		tree: t.tree,
		height: t.height,
		nodeCount: t.nodeCount,
		keyCount: t.keyCount,
		complexity: Math.log2(Math.max(1, t.keyCount)),
		metrics: { timeMs: elapsedMs, comparisons },
		path: meta?.path || [],
		meta
	});
});

app.post('/api/reset', (req, res) => {
	tree.reset();
	records = [];
	persistRecords();
	const t = tree.getTree();
	return res.json({ ok: true, tree: t.tree, height: t.height, nodeCount: t.nodeCount, keyCount: t.keyCount, complexity: Math.log2(Math.max(1, t.keyCount)) });
});

app.listen(PORT, () => {
	console.log(`API listening on :${PORT}`);
});
