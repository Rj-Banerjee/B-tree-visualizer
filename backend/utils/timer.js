function withTimer(fn) {
	const start = process.hrtime.bigint();
	const result = fn();
	const end = process.hrtime.bigint();
	const elapsedMs = Number(end - start) / 1e6;
	let comparisons = undefined;
	let meta = undefined;
	if (result && typeof result === 'object') {
		if (typeof result.comparisons === 'number') comparisons = result.comparisons;
		if (result.meta) meta = result.meta;
	}
	return { result, elapsedMs, comparisons, meta };
}

module.exports = { withTimer };
