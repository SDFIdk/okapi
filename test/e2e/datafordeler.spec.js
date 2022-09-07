const { test, expect } = require('@playwright/test')

test.beforeEach(async ({ page }) => {
  await page.goto('/test/datafordeler.html')
})

test.describe('Display a map', () => {
  
  test('should allow me to see the map', async ({ page }) => {
    await expect(page.locator('.ol-layer canvas')).toBeTruthy()
  })
  
})
