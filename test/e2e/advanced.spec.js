const { test, expect } = require('@playwright/test')

test.beforeEach(async ({ page }) => {
  await page.goto('/test/advanced.html')
})

test.describe('Display an advanced map', () => {
  
  test('should allow me to see the map', async ({ page }) => {
    await expect(page.locator('.ol-layer canvas')).toBeTruthy()
  })

  test('should allow me to toggle the layer switcher', async({ page }) => {
    await page.click('#layer-switcher-button')
    await expect(page.locator('.container1 ')).toHaveClass('container1 expanded')
  })
})
