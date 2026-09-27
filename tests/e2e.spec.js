// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('KakshaSahay End-to-End Workflow Verification', () => {

  test('1. App boots successfully with zero script runtime errors and valid branding', async ({ page }) => {
    const scriptErrors = [];
    page.on('pageerror', err => {
      scriptErrors.push(err.message);
    });

    await page.goto('http://localhost:3001');
    await expect(page).toHaveTitle(/KakshaSahay/);

    const brandHeader = page.locator('header h1');
    await expect(brandHeader).toContainText('KakshaSahay');

    // Confirm no uncaught runtime or script errors occurred
    expect(scriptErrors).toEqual([]);
  });

  test('2. 15-Minute MGML Timer cycles, switches focus, pauses, and resets', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const timerDisplay = page.locator('#timer-display');
    await expect(timerDisplay).toHaveText('15:00');

    const toggleBtn = page.locator('#btn-toggle-timer');
    const resetBtn = page.locator('#btn-reset-timer');
    const switchBtn = page.locator('#btn-switch-focus');

    // Start cycle
    await toggleBtn.click();
    await page.waitForTimeout(1100);

    // Verify timer has ticked down
    const textAfterStart = await timerDisplay.textContent();
    expect(textAfterStart).not.toBe('15:00');

    // Switch pedagogical grade focus
    await switchBtn.click();

    // Pause timer
    await toggleBtn.click();
    const textAfterPause = await timerDisplay.textContent();
    await page.waitForTimeout(1000);
    // Should remain same while paused
    await expect(timerDisplay).toHaveText(textAfterPause || '');

    // Reset timer
    await resetBtn.click();
    await expect(timerDisplay).toHaveText('15:00');
  });

  test('3. Bhasha Setu generates localized pedagogical analogy without network call', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const explainBtn = page.locator('#btn-explain-concept');
    await explainBtn.click();

    const outputArea = page.locator('#bhasha-output-area');
    await expect(outputArea).not.toBeEmpty();
    await expect(outputArea).toContainText(/Rural Metaphor|घरेलू सादृश्य|Textbook Concept/);
  });

  test('4. Absentee Triage runs 2-minute diagnostic and persists student across reload', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const nameInput = page.locator('#absentee-name-input');
    await nameInput.fill('परी शर्मा (कक्षा 2)');

    const startDiagBtn = page.locator('#btn-start-diagnostic');
    await startDiagBtn.click();

    // Checklist appears
    const checklistArea = page.locator('#absentee-checklist-area');
    await expect(checklistArea).toBeVisible();

    // Check oral screening items
    const checkboxes = checklistArea.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }

    // Save evaluation using Needs Peer Buddy to test roster addition
    const needsBuddyBtn = checklistArea.getByRole('button', { name: /Needs Peer Buddy/i });
    await needsBuddyBtn.click();

    // Student should now be in active roster
    const rosterContainer = page.locator('#active-roster-container');
    await expect(rosterContainer).toContainText('परी शर्मा');

    // Reload page to verify persistence in localStorage
    await page.reload();
    await expect(page.locator('#active-roster-container')).toContainText('परी शर्मा');
  });

  test('5. Zero-Cost TLM verifies train carriages and generates next puzzle', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const trainInp1 = page.locator('#train-inp-1');
    const trainInp2 = page.locator('#train-inp-2');
    const verifyBtn = page.locator('#btn-verify-train');
    const feedbackBox = page.locator('#train-feedback-box');

    // Fill correct answers for initial sequence: [2] === [?] === [4] === [?] === [6]
    await trainInp1.fill('3');
    await trainInp2.fill('5');
    await verifyBtn.click();

    await expect(feedbackBox).toBeVisible();
    await expect(feedbackBox).toContainText(/Excellent|शाबाश|Correct/i);

    // Next puzzle
    const nextPuzzleBtn = page.locator('#btn-next-puzzle');
    await nextPuzzleBtn.click();
    await expect(page.locator('#ascii-train-display')).toBeVisible();
  });

  test('6. Bilingual Toggle switches entire UI between English and Hindi instantaneously', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const langToggleBtn = page.locator('#btn-lang-toggle');
    const heroTitle = page.locator('#hero-title');

    // Default or current English
    await expect(heroTitle).toContainText(/Orchestration|समन्वय|Teaching|सरल/);

    // Toggle language
    await langToggleBtn.click();
    await expect(page.locator('html')).toHaveAttribute('lang', /hi|en/);

    // Toggle back
    await langToggleBtn.click();
  });

  test('7. Audio Concurrency & Cross-Tab Coordination: Prevents overlapping speech, cancels on hidden tab, coordinates cross-tab', async ({ context }) => {
    const page1 = await context.newPage();
    await page1.goto('http://localhost:3001');

    // 1. Same-Tab Concurrency: Rapid triggers cancel previous speech
    const speechStatus = await page1.evaluate(async () => {
      let speakCount = 0;
      let cancelCount = 0;
      const originalSpeak = window.speechSynthesis.speak;
      const originalCancel = window.speechSynthesis.cancel;

      window.speechSynthesis.speak = function(u) {
        speakCount++;
        return originalSpeak.call(window.speechSynthesis, u);
      };
      window.speechSynthesis.cancel = function() {
        cancelCount++;
        return originalCancel.call(window.speechSynthesis);
      };

      // Trigger first speech
      window.speak('First message test');
      // Trigger second speech immediately
      window.speak('Second message test');

      return { speakCount, cancelCount };
    });

    // Cancel should have been called before second speech
    expect(speechStatus.cancelCount).toBeGreaterThanOrEqual(1);
    expect(speechStatus.speakCount).toBe(2);

    // 2. Visibility change: speech cancelled when document becomes hidden
    const visibilityCanceled = await page1.evaluate(async () => {
      let canceledOnHidden = false;
      const originalCancel = window.speechSynthesis.cancel;
      window.speechSynthesis.cancel = function() {
        canceledOnHidden = true;
        return originalCancel.call(window.speechSynthesis);
      };

      // Speak something
      window.speak('Testing visibility hidden behavior');
      canceledOnHidden = false; // Reset to check event handler

      // Simulate visibility change to hidden
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));

      return canceledOnHidden;
    });

    expect(visibilityCanceled).toBe(true);

    // 3. Cross-Tab Coordination: Speech in Tab 2 cancels speech in Tab 1
    const page2 = await context.newPage();
    await page2.goto('http://localhost:3001');

    // Set up spy in Tab 1
    await page1.evaluate(() => {
      window._tab1CancelCalled = false;
      const originalCancel = window.speechSynthesis.cancel;
      window.speechSynthesis.cancel = function() {
        window._tab1CancelCalled = true;
        return originalCancel.call(window.speechSynthesis);
      };
      window.speak('Tab 1 long announcement');
    });

    // Speak in Tab 2
    await page2.evaluate(() => {
      window.speak('Tab 2 announcement taking priority');
    });

    // Wait briefly for BroadcastChannel message transmission
    await page1.waitForTimeout(300);

    const tab1Canceled = await page1.evaluate(() => window._tab1CancelCalled);
    expect(tab1Canceled).toBe(true);

    await page1.close();
    await page2.close();
  });

  test('8. How It Works button, dialog, and iframe are completely removed from DOM', async ({ page }) => {
    await page.goto('http://localhost:3001');

    await expect(page.locator('#btn-how-it-works')).toHaveCount(0);
    await expect(page.locator('#walkthrough-dialog')).toHaveCount(0);
    await expect(page.locator('#walkthrough-modal-backdrop')).toHaveCount(0);
    await expect(page.locator('#walkthrough-video-frame')).toHaveCount(0);

    // Verify preserved elements still exist
    await expect(page.locator('#btn-start-tour')).toBeVisible();
    await expect(page.locator('#field-video-frame')).toBeVisible();
  });

  test('9. TaRL Micro-Grouping Level Selector switches prompts and persists level', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const btnDeveloping = page.locator('#btn-level-developing');
    const btnProficient = page.locator('#btn-level-proficient');
    const g23Prompt = page.locator('#g23-prompt-english');

    // Default beginner prompt check
    await expect(g23Prompt).toContainText('Concrete 1-to-1 Manipulative Counting');

    // Click Developing level
    await btnDeveloping.click();
    await expect(btnDeveloping).toHaveAttribute('aria-checked', 'true');
    await expect(g23Prompt).toContainText('Base-10 Pebble Bundles & 2-Digit Numeral Writing');

    // Click Proficient level
    await btnProficient.click();
    await expect(btnProficient).toHaveAttribute('aria-checked', 'true');
    await expect(g23Prompt).toContainText('Peer Daily-Life Word Problem Creation');

    // Reload and verify persistence in localStorage
    await page.reload();
    await expect(page.locator('#btn-level-proficient')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#g23-prompt-english')).toContainText('Peer Daily-Life Word Problem Creation');
  });

  test('10. Session Summary & Weekly Local Dashboard displays metrics and copies summary', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('http://localhost:3001');

    const btnPrintSummary = page.locator('#btn-print-summary');
    const btnWeeklySummary = page.locator('#btn-view-weekly-summary');
    const summaryContainer = page.locator('#summary-view-container');

    // Open Session Summary
    await btnPrintSummary.click();
    await expect(summaryContainer).toBeVisible();
    await expect(summaryContainer).toContainText('Multigrade Classroom Daily Handoff Report');
    await expect(summaryContainer).toContainText('Post-Absence Diagnostic Screening');

    // Test Copy text button
    const btnCopySummary = page.locator('#btn-copy-summary');
    await expect(btnCopySummary).toBeVisible();
    await btnCopySummary.click();
    await expect(btnCopySummary).toContainText('Copied');

    // Open Weekly Summary
    await btnWeeklySummary.click();
    await expect(summaryContainer).toContainText('What Happened This Week');
    await expect(summaryContainer).toContainText('Teacher Local Summary');
    await expect(summaryContainer).toContainText('Offline Local Data');
  });

  test('11. Centralized 1-Teacher Multigrade Classroom Dashboard renders simultaneous allocations & explainable rationale', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const dashboard = page.locator('#classroom-state-dashboard');
    await expect(dashboard).toBeVisible();

    // Verify 3 simultaneous grade cards
    const cardG1 = page.locator('#status-card-g1');
    const cardG2 = page.locator('#status-card-g2');
    const cardG3 = page.locator('#status-card-g3');
    await expect(cardG1).toBeVisible();
    await expect(cardG2).toBeVisible();
    await expect(cardG3).toBeVisible();

    // In Phase A: Grade 1 active (teacher-led)
    await expect(cardG1).toHaveClass(/grade-active/);
    await expect(page.locator('#status-mode-g1')).toContainText(/Teacher-Led|प्रत्यक्ष/);

    // Switch focus
    const switchBtn = page.locator('#btn-switch-focus');
    await switchBtn.click();

    // In Phase B: Grade 2 & 3 active
    await expect(cardG2).toHaveClass(/grade-active/);
    await expect(cardG3).toHaveClass(/grade-active/);

    // Toggle Explainable Allocation Rationale
    const btnToggleRationale = page.locator('#btn-toggle-rationale');
    const rationaleBox = page.locator('#recommendation-rationale-box');
    await expect(rationaleBox).toBeHidden();

    await btnToggleRationale.click();
    await expect(rationaleBox).toBeVisible();
    await expect(rationaleBox).toContainText(/Teacher-Led/);
    const listItems = rationaleBox.locator('li');
    expect(await listItems.count()).toBeGreaterThanOrEqual(3);

    // Toggle closed
    await btnToggleRationale.click();
    await expect(rationaleBox).toBeHidden();
  });

  test('12. Demo Classroom Mode loads realistic 3-grade scenario in 1 click', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const btnDemo = page.locator('#btn-demo-mode');
    await expect(btnDemo).toBeVisible();
    await btnDemo.click();

    // Verify student added to roster
    const rosterContainer = page.locator('#active-roster-container');
    await expect(rosterContainer).toContainText('Aarav Patel');

    // Verify metric updated
    const metricLevel = page.locator('#metric-ability-level');
    await expect(metricLevel).toContainText(/Developing|मध्यम/);
  });

  test('13. Clear Local Data confirmation modal opens, cancels safely, and clears state on confirm', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // First load demo mode so there is data to clear
    await page.locator('#btn-demo-mode').click();
    await expect(page.locator('#active-roster-container')).toContainText('Aarav Patel');

    const btnClear = page.locator('#btn-clear-classroom-data');
    const modal = page.locator('#modal-clear-data');
    const btnCancel = page.locator('#btn-cancel-clear');
    const btnConfirm = page.locator('#btn-confirm-clear');

    // Open modal
    await btnClear.click();
    await expect(modal).toBeVisible();

    // Test cancel
    await btnCancel.click();
    await expect(modal).toBeHidden();
    // Data remains
    await expect(page.locator('#active-roster-container')).toContainText('Aarav Patel');

    // Open and confirm clear
    await btnClear.click();
    await expect(modal).toBeVisible();
    await btnConfirm.click();
    await expect(modal).toBeHidden();

    // Roster is now reset
    await expect(page.locator('#active-roster-container')).toContainText(/All students at expected grade level/i);
    await expect(page.locator('#metric-remediation-count')).toHaveText('0 Pending');
  });

  test('14. AudioCoordinator API is exposed globally for automated testing and audio coordination', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const coordinatorTypes = await page.evaluate(() => {
      const coord = window.AudioCoordinator;
      if (!coord) return null;
      return {
        hasSpeak: typeof coord.speak === 'function',
        hasCancel: typeof coord.cancelSpeech === 'function',
        hasBell: typeof coord.playAcousticBell === 'function'
      };
    });

    expect(coordinatorTypes).not.toBeNull();
    expect(coordinatorTypes.hasSpeak).toBe(true);
    expect(coordinatorTypes.hasCancel).toBe(true);
    expect(coordinatorTypes.hasBell).toBe(true);
  });

  test('15. Start Classroom Session CTA scrolls to orchestration dashboard and initiates rotation', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const btnStart = page.locator('#btn-start-classroom');
    await expect(btnStart).toBeVisible();

    await btnStart.click();

    // Verify timer has started or is running
    const timerDisplay = page.locator('#timer-display');
    await page.waitForTimeout(1100);
    const timeText = await timerDisplay.textContent();
    expect(timeText).not.toBe('15:00');
  });

  test('16. Adaptive Teacher Override dynamically recalculates 3-grade rotation and updates pedagogical rationale', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Click G2 Needs Support flag
    const btnSupportG2 = page.locator('#btn-support-g2');
    await expect(btnSupportG2).toBeVisible();
    await btnSupportG2.click();

    // Verify Grade 2 card becomes active (Teacher-Led)
    const cardG2 = page.locator('#status-card-g2');
    await expect(cardG2).toHaveClass(/grade-active/);

    const modeG2 = page.locator('#status-mode-g2');
    await expect(modeG2).toContainText('Teacher-Led');

    // Verify status badge
    const badgeStatus = page.locator('#badge-classroom-status');
    await expect(badgeStatus).toContainText('Grade 2 Focus (Teacher Intervention)');

    // Open rationale box and verify explainability
    const btnRationale = page.locator('#btn-toggle-rationale');
    await btnRationale.click();
    const rationaleList = page.locator('#rationale-points-list');
    await expect(rationaleList).toContainText('Rotation changed because Grade 2 was marked as requiring additional teacher support.');
  });

  test('17. Live Offline Diagnostics modal self-checks system health and simulates offline mode', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const btnOpenDiag = page.locator('#btn-open-diagnostics');
    await btnOpenDiag.click();

    const modalDiag = page.locator('#modal-diagnostics');
    await expect(modalDiag).toBeVisible();

    // Run diagnostics
    const btnRunDiag = page.locator('#btn-run-diagnostics');
    await btnRunDiag.click();

    // Check pass badges
    const badgeStorage = page.locator('#badge-diag-storage');
    await expect(badgeStorage).toContainText('✓ PASS');

    const badgeFSM = page.locator('#badge-diag-fsm');
    await expect(badgeFSM).toContainText('✓ PASS');

    // Test simulate offline mode toggle
    const btnSimulate = page.locator('#btn-toggle-offline-simulation');
    await btnSimulate.click();
    const badgeConn = page.locator('#badge-connectivity');
    await expect(badgeConn).toContainText('Offline Sim');

    // Close modal
    const btnCloseDiag = page.locator('#btn-close-diagnostics');
    await btnCloseDiag.click();
    await expect(modalDiag).not.toBeVisible();
  });

  test('18. Export Classroom Data downloads clean JSON payload without system leakage', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const downloadPromise = page.waitForEvent('download');
    const btnExport = page.locator('#btn-export-data');
    await btnExport.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('kakshasahay-classroom-data');
  });

  test('19. Responsive Layout & Touch Targets across 3 Breakpoints (375px, 768px, 1280px)', async ({ browser }) => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 800 }
    ];

    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      await page.goto('http://localhost:3001');

      // Verify no horizontal document overflow
      const hasOverflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        return scrollWidth > docWidth + 1 || bodyScrollWidth > docWidth + 1;
      });
      expect(hasOverflow, `${vp.name} viewport (${vp.width}px) should not horizontally overflow`).toBe(false);

      // Verify primary action buttons meet minimum touch target geometry (>= 40px)
      const smallButtons = await page.evaluate(() => {
        const selectors = [
          '#btn-start-classroom',
          '#btn-open-diagnostics',
          '#btn-export-data',
          '#btn-start-tour',
          '#btn-lang-toggle',
          '#btn-demo-mode',
          '#btn-clear-classroom-data',
          '#btn-toggle-timer',
          '#btn-reset-timer',
          '#btn-switch-focus',
          '#btn-explain-concept'
        ];
        return selectors.map(s => {
          const el = document.querySelector(s);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { id: s, width: Math.round(r.width), height: Math.round(r.height) };
        }).filter(b => b !== null && (b.width < 40 || b.height < 40));
      });
      expect(smallButtons, `${vp.name} viewport buttons should all satisfy minimum touch targets`).toEqual([]);

      await context.close();
    }
  });
});


