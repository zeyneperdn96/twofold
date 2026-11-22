// End-to-end check of the TwoFold React app against the local preview build.
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core')
const OUT = process.argv[2]
const URL = 'http://localhost:4399'

const results = []
const check = (name, ok, extra = '') => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`)
}

;(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

  await page.goto(URL)
  await page.waitForSelector('text=Paris weekend')
  check('home lists demo trip', true)
  check('demo trip is live', await page.isVisible('a:has-text("Paris weekend") >> text=Live'))
  await page.screenshot({ path: `${OUT}/1-home.png` })

  // trip page opens on today (day 2)
  await page.click('text=Paris weekend')
  await page.waitForSelector('text=Versailles day trip')
  check('opens on today (day 2)', await page.isVisible('text=Picnic at Trocadéro'))
  check('lived/awaiting count', await page.isVisible('text=6 lived · 3 awaiting'),
    await page.locator('text=/lived ·/').first().textContent())
  await page.screenshot({ path: `${OUT}/2-trip-today.png`, fullPage: true })

  // day 1: divergence + edit link for Zeynep
  await page.locator('button:has-text("Louvre"), button').filter({ hasText: /^\D+\d+$/ }).first().click()
  await page.waitForSelector('text=Louvre Museum'); await page.waitForTimeout(1800)
  check('divergence shown on Louvre', await page.isVisible('text=You and Mike saw this one differently.'))
  check('crepe: add your side (Zeynep not there)', (await page.locator('text=Add your side →').count()) >= 1)
  await page.screenshot({ path: `${OUT}/3-day1.png`, fullPage: true })

  // Day 2: tell the story for Picnic (plan-only, today)
  await page.locator('button').filter({ hasText: /^\D+\d+$/ }).nth(1).click()
  await page.waitForSelector('text=Picnic at Trocadéro'); await page.waitForTimeout(1800)
  const picnic = page.locator('article', { hasText: 'Picnic at Trocadéro' })
  await picnic.locator('text=Tell the story →').click()
  await page.waitForSelector('[role=dialog]')
  await page.screenshot({ path: `${OUT}/4-story-sheet.png` })
  const saveBtn = page.locator('[role=dialog] button[type=submit]')
  check('save disabled while empty', await saveBtn.isDisabled())
  await page.fill('[role=dialog] textarea', 'The tower sparkled at ten and everyone went quiet.')
  await page.fill('[role=dialog] input[inputmode=decimal]', '12')
  await page.click('[role=dialog] button[role=radio]:has-text("WOW")')
  await saveBtn.click()
  await page.waitForSelector('[role=dialog]', { state: 'detached' }) ; await page.waitForTimeout(900)
  const picnicAfter = page.locator('article', { hasText: 'Picnic at Trocadéro' })
  check('picnic became experienced', await picnicAfter.locator('text=WHAT HAPPENED').isVisible())
  check('picnic shows my note', await picnicAfter.locator('text=The tower sparkled').isVisible())
  check('picnic cost 12€', await picnicAfter.locator('text=12€').isVisible())
  check('counts updated', await page.isVisible('text=7 lived · 2 awaiting'))

  // Add a planned moment via FAB
  await page.click('button[aria-label*="Add a moment"]')
  await page.waitForSelector('[role=dialog]')
  await page.fill('[role=dialog] input[maxlength="80"]', 'Seine boat ride')
  await page.fill('[role=dialog] input[type=time]', '21:15')
  await page.fill('[role=dialog] input[inputmode=decimal]', '17')
  await page.fill('[role=dialog] textarea', 'Lights from the water.')
  await page.click('[role=dialog] button[type=submit]')
  await page.waitForSelector('[role=dialog]', { state: 'detached' }) ; await page.waitForTimeout(900)
  check('planned moment added', await page.isVisible('text=Seine boat ride'))

  // Add a surprise
  await page.click('button[aria-label*="Add a moment"]')
  await page.click('[role=dialog] >> text=✦ It just happened')
  await page.fill('[role=dialog] input[maxlength="80"]', 'Street accordion player')
  const surpriseSave = page.locator('[role=dialog] button[type=submit]')
  check('surprise needs a sentence', await surpriseSave.isDisabled())
  await page.fill('[role=dialog] textarea', 'Stopped for one song, stayed for five.')
  await surpriseSave.click()
  await page.waitForSelector('[role=dialog]', { state: 'detached' }) ; await page.waitForTimeout(900)
  check('surprise card added', await page.isVisible('article:has-text("Street accordion player") >> text=SURPRISE'))
  await page.screenshot({ path: `${OUT}/5-day2-after.png`, fullPage: true })

  // Persistence across reload
  await page.reload()
  await page.waitForSelector('text=Versailles day trip')
  check('persists after reload', await page.isVisible('text=Seine boat ride') && await page.isVisible('text=Street accordion player'))

  // Language switch + persists
  await page.click('button[aria-label="Switch language to TR"]')
  check('TR strings', await page.isVisible('text=Canlı'))
  await page.reload()
  await page.waitForSelector('text=Versailles day trip')
  check('locale persists', await page.isVisible('text=Canlı'))
  await page.click('button[aria-label="Switch language to EN"]')

  // New trip flow
  await page.goto(URL)
  await page.click('button[aria-label="+ New Trip"]')
  await page.waitForSelector('[role=dialog]')
  await page.fill('[role=dialog] input[maxlength="60"]', 'Lisbon in spring')
  const future = new Date(); future.setDate(future.getDate() + 10)
  const iso = future.toISOString().slice(0, 10)
  await page.fill('[role=dialog] input[type=date]', iso)
  await page.click('[role=dialog] button[aria-label="+"]')
  await page.fill('[role=dialog] input[placeholder="Alex, Mike"]', 'Alex, Deniz')
  await page.screenshot({ path: `${OUT}/6-new-trip.png` })
  await page.click('[role=dialog] button[type=submit]')
  await page.waitForURL(/\/trip\//)
  await page.waitForSelector('text=Lisbon in spring')
  check('new trip: 4 days, 3 souls', await page.isVisible('text=4 days, 3 souls'))
  check('new trip: starts in 10 days', await page.isVisible('text=Starts in 10 days'))
  check('new trip: empty day', await page.isVisible('text=This day is still unwritten.'))
  await page.screenshot({ path: `${OUT}/7-new-trip-page.png` })

  // Delete it (two taps)
  await page.click('text=Delete trip')
  await page.click('text=Tap again to delete')
  await page.waitForURL(URL + '/')
  check('trip deleted', !(await page.isVisible('text=Lisbon in spring')))

  // Unknown trip
  await page.goto(URL + '/trip/nope')
  check('unknown trip message', await page.isVisible('text=This trip does not exist anymore.'))

  // Reset demo
  await page.goto(URL)
  await page.click('text=Reset demo')
  await page.click('text=Paris weekend')
  check('reset removes added moments', !(await page.isVisible('text=Seine boat ride')))

  check('no console/page errors', errors.length === 0, errors.join(' | '))
  console.log(results.join('\n'))
  await browser.close()
})().catch((e) => {
  console.log(results.join('\n'))
  console.error('CRASH', e.message)
  process.exit(1)
})
