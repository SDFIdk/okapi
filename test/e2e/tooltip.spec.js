const { test, expect } = require('@playwright/test')

test.beforeEach(async ({ page }) => {
  await page.goto('/test/tooltip.html')
})

test.describe('Display a map with a single marker', () => {
  
  test('should allow me to see the map', async ({ page }) => {
    await expect(page.locator('.ol-layer canvas')).toBeTruthy()
  })
  
})
