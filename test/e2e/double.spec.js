import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/docs/double.html')
})

test.describe('Display a map', () => {
  
  test('should allow me to see 2 maps', async ({ page }) => {
    await expect(page.locator('#this-is-the-unique-id .ol-layer canvas')).toBeTruthy()
    await expect(page.locator('#this-is-another-unique-id .ol-layer canvas')).toBeTruthy()
  })
  
})
