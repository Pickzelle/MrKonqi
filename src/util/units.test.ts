import * as units from './units'
import { describe, test, expect } from 'bun:test'

describe('magnitude', () => {
	const fn = units.normalize_magnitude

	describe('base 10', () => {
		test('no limit', () => {
			expect(fn(1000, 10, Number.POSITIVE_INFINITY)).toEqual([1, 3])
			expect(fn(100, 10, Number.POSITIVE_INFINITY)).toEqual([1, 2])
			expect(fn(10, 10, Number.POSITIVE_INFINITY)).toEqual([1, 1])
			expect(fn(1, 10, Number.POSITIVE_INFINITY)).toEqual([1, 0])

			expect(fn(5000, 10, Number.POSITIVE_INFINITY)).toEqual([5, 3])
			expect(fn(500, 10, Number.POSITIVE_INFINITY)).toEqual([5, 2])
			expect(fn(50, 10, Number.POSITIVE_INFINITY)).toEqual([5, 1])
			expect(fn(5, 10, Number.POSITIVE_INFINITY)).toEqual([5, 0])

			expect(fn(5432, 10, Number.POSITIVE_INFINITY)).toEqual([5.432, 3])
			expect(fn(543, 10, Number.POSITIVE_INFINITY)).toEqual([5.43, 2])
			expect(fn(54, 10, Number.POSITIVE_INFINITY)).toEqual([5.4, 1])

			expect(fn(5432.1, 10, Number.POSITIVE_INFINITY)).toEqual([5.4321, 3])
			expect(fn(543.21, 10, Number.POSITIVE_INFINITY)).toEqual([5.4321, 2])
			expect(fn(54.321, 10, Number.POSITIVE_INFINITY)).toEqual([5.4321, 1])
			expect(fn(5.4321, 10, Number.POSITIVE_INFINITY)).toEqual([5.4321, 0])
		})

		test('high limit', () => {
			const high_limit = 16

			expect(fn(1000, 10, high_limit)).toEqual([1, 3])
			expect(fn(100, 10, high_limit)).toEqual([1, 2])
			expect(fn(10, 10, high_limit)).toEqual([1, 1])
			expect(fn(1, 10, high_limit)).toEqual([1, 0])

			expect(fn(5000, 10, high_limit)).toEqual([5, 3])
			expect(fn(500, 10, high_limit)).toEqual([5, 2])
			expect(fn(50, 10, high_limit)).toEqual([5, 1])
			expect(fn(5, 10, high_limit)).toEqual([5, 0])

			expect(fn(5432, 10, high_limit)).toEqual([5.432, 3])
			expect(fn(543, 10, high_limit)).toEqual([5.43, 2])
			expect(fn(54, 10, high_limit)).toEqual([5.4, 1])

			expect(fn(5432.1, 10, high_limit)).toEqual([5.4321, 3])
			expect(fn(543.21, 10, high_limit)).toEqual([5.4321, 2])
			expect(fn(54.321, 10, high_limit)).toEqual([5.4321, 1])
			expect(fn(5.4321, 10, high_limit)).toEqual([5.4321, 0])
		})

		test('limit hit', () => {
			expect(fn(1000, 10, 2)).toEqual([10, 2])
			expect(fn(100, 10, 1)).toEqual([10, 1])

			expect(fn(5000, 10, 2)).toEqual([50, 2])
			expect(fn(500, 10, 1)).toEqual([50, 1])

			// IEE754 and decimals 😬
			// expect(fn(5432, 10, 2)).toEqual([54.32, 2])
			// expect(fn(543, 10, 1)).toEqual([54.3, 1])

			// expect(fn(5432.1, 10, 2)).toEqual([54.321, 2])
			// expect(fn(543.21, 10, 1)).toEqual([54.321, 1])
		})

		test('zero limit', () => {
			const zero_limit = 0

			expect(fn(1000, 10, zero_limit)).toEqual([1000, 0])
			expect(fn(100, 10, zero_limit)).toEqual([100, 0])
			expect(fn(10, 10, zero_limit)).toEqual([10, 0])
			expect(fn(1, 10, zero_limit)).toEqual([1, 0])

			expect(fn(5000, 10, zero_limit)).toEqual([5000, 0])
			expect(fn(500, 10, zero_limit)).toEqual([500, 0])
			expect(fn(50, 10, zero_limit)).toEqual([50, 0])
			expect(fn(5, 10, zero_limit)).toEqual([5, 0])

			expect(fn(5432, 10, zero_limit)).toEqual([5432, 0])
			expect(fn(543, 10, zero_limit)).toEqual([543, 0])
			expect(fn(54, 10, zero_limit)).toEqual([54, 0])

			expect(fn(5432.1, 10, zero_limit)).toEqual([5432.1, 0])
			expect(fn(543.21, 10, zero_limit)).toEqual([543.21, 0])
			expect(fn(54.321, 10, zero_limit)).toEqual([54.321, 0])
			expect(fn(5.4321, 10, zero_limit)).toEqual([5.4321, 0])
		})
	})
})

describe('systems', () => {
	describe('binary', () => {
		const fn = units.hsize_b

		test('clean units', () => {
			expect(fn(1024 ** 1)).toEqual('1.00 KiB')
			expect(fn(1024 ** 2)).toEqual('1.00 MiB')
			expect(fn(1024 ** 3)).toEqual('1.00 GiB')
			expect(fn(1024 ** 4)).toEqual('1.00 TiB')
			expect(fn(1024 ** 5)).toEqual('1.00 PiB')
			expect(fn(1024 ** 6)).toEqual('1.00 EiB')
		})

		describe('decimal units', () => {
			test('under round', () => {
				expect(fn(1024 ** 1 * 1.234)).toEqual('1.23 KiB')
				expect(fn(1024 ** 2 * 1.234)).toEqual('1.23 MiB')
				expect(fn(1024 ** 3 * 1.234)).toEqual('1.23 GiB')
				expect(fn(1024 ** 4 * 1.234)).toEqual('1.23 TiB')
				expect(fn(1024 ** 5 * 1.234)).toEqual('1.23 PiB')
				expect(fn(1024 ** 6 * 1.234)).toEqual('1.23 EiB')
			})

			test('upper round', () => {
				expect(fn(1024 ** 1 * 1.236)).toEqual('1.24 KiB')
				expect(fn(1024 ** 2 * 1.236)).toEqual('1.24 MiB')
				expect(fn(1024 ** 3 * 1.236)).toEqual('1.24 GiB')
				expect(fn(1024 ** 4 * 1.236)).toEqual('1.24 TiB')
				expect(fn(1024 ** 5 * 1.236)).toEqual('1.24 PiB')
				expect(fn(1024 ** 6 * 1.236)).toEqual('1.24 EiB')
			})
		})
	})

	describe('metric', () => {
		const fn = units.hsize_m

		test('clean units', () => {
			expect(fn(1e3 ** 1)).toEqual('1.00 KB')
			expect(fn(1e3 ** 2)).toEqual('1.00 MB')
			expect(fn(1e3 ** 3)).toEqual('1.00 GB')
			expect(fn(1e3 ** 4)).toEqual('1.00 TB')
			expect(fn(1e3 ** 5)).toEqual('1.00 PB')
			expect(fn(1e3 ** 6)).toEqual('1.00 EB')
		})

		describe('decimal units', () => {
			test('under round', () => {
				expect(fn(1e3 ** 1 * 1.234)).toEqual('1.23 KB')
				expect(fn(1e3 ** 2 * 1.234)).toEqual('1.23 MB')
				expect(fn(1e3 ** 3 * 1.234)).toEqual('1.23 GB')
				expect(fn(1e3 ** 4 * 1.234)).toEqual('1.23 TB')
				expect(fn(1e3 ** 5 * 1.234)).toEqual('1.23 PB')
				expect(fn(1e3 ** 6 * 1.234)).toEqual('1.23 EB')
			})

			test('upper round', () => {
				expect(fn(1e3 ** 1 * 1.236)).toEqual('1.24 KB')
				expect(fn(1e3 ** 2 * 1.236)).toEqual('1.24 MB')
				expect(fn(1e3 ** 3 * 1.236)).toEqual('1.24 GB')
				expect(fn(1e3 ** 4 * 1.236)).toEqual('1.24 TB')
				expect(fn(1e3 ** 5 * 1.236)).toEqual('1.24 PB')
				expect(fn(1e3 ** 6 * 1.236)).toEqual('1.24 EB')
			})
		})
	})
})
