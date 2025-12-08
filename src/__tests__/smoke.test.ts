import { describe, it, expect } from 'vitest'

describe('Smoke Test', () => {
    it('should pass basic math', () => {
        expect(1 + 1).toBe(2)
    })

    it('should have jsdom environment', () => {
        expect(window).toBeDefined()
        expect(document).toBeDefined()
    })
})
