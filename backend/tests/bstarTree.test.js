const { BStarTree } = require('../bstarTree')

describe('B* Tree basic operations', () => {
	test('insert and search', () => {
		const t = new BStarTree(3)
		const nums = [50, 20, 70, 10, 30, 60, 80, 25]
		nums.forEach(n => t.insert(n))
		expect(t.search(30).found).toBe(true)
		expect(t.search(99).found).toBe(false)
		const meta = t.getTree()
		expect(meta.keyCount).toBe(nums.length)
	})

	test('delete leaf and internal with rebalancing', () => {
		const t = new BStarTree(3)
		const nums = [40, 20, 60, 10, 30, 50, 70, 5, 15]
		nums.forEach(n => t.insert(n))
		t.delete(10)
		t.delete(20)
		expect(t.search(10).found).toBe(false)
		expect(t.search(20).found).toBe(false)
		const meta = t.getTree()
		expect(meta.keyCount).toBe(nums.length - 2)
	})
})

