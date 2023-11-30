import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/docs/datafordeler.html')
})

test.describe('Display a map', () => {
  
  test('should allow me to see the map', async ({ page }) => {
    await expect(page.locator('.ol-layer canvas')).toBeTruthy()
  })
  
})
