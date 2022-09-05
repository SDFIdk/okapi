const { test, expect } = require('@playwright/test')

test.beforeEach(async ({ page }) => {
  await page.goto('/examples/simple.html')
})

test.describe('Display a map', () => {
  
  test('should allow me to see the map', async ({ page }) => {
    await expect(page.locator('.ol-layer canvas')).toBeTruthy()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot({timeout: 1500, maxDiffPixelRatio: 0.02 })
  })
  
})
