import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/docs/tooltip.html')
})

test.describe('Display a map with a single marker', () => {
  
  test('should allow me to see the map', async ({ page }) => {
    await expect(page.locator('.ol-layer canvas')).toBeTruthy()
  })
  
})
