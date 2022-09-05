const { test, expect } = require('@playwright/test')

test.beforeEach(async ({ page }) => {
  await page.goto('/examples/markers-simple.html')
})

test.describe('Display a map with a single marker', () => {
  
  test('should allow me to see a marker on the map', async ({ page }) => {
    await expect(page.locator('.ol-selectable')).toBeTruthy()
  })
  
})
