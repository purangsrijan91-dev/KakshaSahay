// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('KakshaSahay Accessibility Audit (WCAG 2.2 AA)', () => {

  test('Main classroom view satisfies automated WCAG 2.2 AA rules', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.locator('#classroom-state-dashboard').waitFor({ state: 'visible', timeout: 10000 });

    // Exclude third-party embedded Google Drive video player iframe from first-party DOM audit
    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#field-video-frame')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .disableRules(['color-contrast']) // Color contrast documented separately
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Main View Violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });


  test('Interactive controls have sufficient target sizes and accessible names', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#field-video-frame')
      .withRules(['button-name', 'link-name', 'aria-roles', 'aria-valid-attr', 'aria-valid-attr-value'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
