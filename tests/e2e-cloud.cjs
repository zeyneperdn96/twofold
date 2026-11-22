// Two people, two browsers, one real Supabase project.
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core')
const OUT = process.argv[2]
const URL = process.argv[3] || 'http://localhost:4400'
const results = []
const check = (name, ok, extra = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`)

;(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  })
  const errors = []
  const person = async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(e.message))
    return page
  }
  const A = await person()
  const B = await person()

  // --- A: first run asks for a name ---
  await A.goto(URL)
  await A.waitForSelector('text=What should we call you?', { timeout: 20000 })
  check('A: name screen', true)
  await A.fill('input[autocomplete="given-name"]', 'Zeynep')
  await A.click('button:has-text("Continue")')
  await A.waitForSelector('text=No trips yet. Where to first?', { timeout: 20000 })
  check('A: empty home, no demo data', !(await A.isVisible('text=Paris weekend')))

  // --- A creates a live trip starting yesterday ---
  await A.click('button[aria-label="+ New Trip"]')
  await A.fill('[role=dialog] input[maxlength="60"]', 'Cloud test trip')
  const y = new Date(); y.setDate(y.getDate() - 1)
  const iso = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`
  await A.fill('[role=dialog] input[type=date]', iso)
  check('A: no companions field in cloud', !(await A.isVisible('[role=dialog] input[placeholder="Alex, Mike"]')))
  await A.click('[role=dialog] button[type=submit]')
  await A.waitForSelector('[data-testid=invite-code]', { timeout: 20000 })
  const code = (await A.textContent('[data-testid=invite-code]')).trim()
  const link = (await A.textContent('[data-testid=invite-link]')).trim()
  check('A: invite sheet opens with code', /^[0-9A-F]{8}$/.test(code), code)
  await A.screenshot({ path: `${OUT}/c1-invite.png` })
  await A.keyboard.press('Escape')
  const tripUrl = A.url()

  // --- B: wrong code first, then the real link ---
  await B.goto(`${URL}/join/ZZZZ0000`)
  await B.waitForSelector('text=What should we call you?', { timeout: 20000 })
  await B.fill('input[autocomplete="given-name"]', 'Alex')
  await B.click('button:has-text("Continue")')
  await B.waitForSelector('text=That invite code does not work.', { timeout: 20000 })
  check('B: wrong code rejected', true)
  await B.goto(link)
  await B.waitForSelector('text=Cloud test trip', { timeout: 20000 })
  check('B: joined via link', B.url() === tripUrl, B.url())
  check('B: sees 2 souls', await B.isVisible('text=3 days, 2 souls'))
  check('B: cannot delete (not creator)', !(await B.isVisible('text=Delete trip')))

  // --- A adds a plan for today; B sees it live ---
  await A.waitForSelector('text=3 days, 2 souls', { timeout: 15000 })
  check('A: sees B joined (realtime)', true)
  await A.click('button[aria-label*="Add a moment"]')
  await A.fill('[role=dialog] input[maxlength="80"]', 'Tram 28 ride')
  await A.fill('[role=dialog] input[type=time]', '10:30')
  await A.fill('[role=dialog] input[inputmode=decimal]', '3')
  await A.fill('[role=dialog] textarea', 'Front seat if we can.')
  await A.click('[role=dialog] button[type=submit]')
  await B.waitForSelector('text=Tram 28 ride', { timeout: 15000 })
  check('B: sees A plan without reload', true)

  // --- both tell their side, opposite verdicts ---
  await B.waitForTimeout(800)
  await B.locator('article', { hasText: 'Tram 28 ride' }).locator('text=Tell the story →').click()
  await B.fill('[role=dialog] textarea', 'Packed and slow, but the hills were pretty.')
  await B.fill('[role=dialog] input[inputmode=decimal]', '3')
  await B.click('[role=dialog] button[role=radio]:has-text("MEH")')
  await B.click('[role=dialog] button[type=submit]')
  await A.waitForSelector('text=Packed and slow', { timeout: 15000 })
  check('A: sees B story live', true)

  await A.waitForTimeout(800)
  await A.locator('article', { hasText: 'Tram 28 ride' }).locator('text=Add your side →').click()
  await A.fill('[role=dialog] textarea', 'Best three euros of the trip.')
  await A.click('[role=dialog] button[role=radio]:has-text("WOW")')
  await A.click('[role=dialog] button[type=submit]')
  await A.waitForSelector('text=You and Alex saw this one differently.', { timeout: 15000 })
  check('A: divergence with Alex', true)
  await B.waitForSelector('text=You and Zeynep saw this one differently.', { timeout: 15000 })
  check('B: divergence with Zeynep', true)

  // --- B edits own side (upsert keeps one row) ---
  await B.waitForTimeout(800)
  await B.locator('article', { hasText: 'Tram 28 ride' }).locator('text=Edit your side').click()
  await B.fill('[role=dialog] textarea', 'Okay, it grew on me.')
  await B.click('[role=dialog] button[type=submit]')
  await A.waitForSelector('text=Okay, it grew on me.', { timeout: 15000 })
  check('edit replaces, not duplicates', (await A.locator('text=2 voices').count()) === 1)

  // --- surprise by B ---
  await B.click('button[aria-label*="Add a moment"]')
  await B.click('[role=dialog] >> text=✦ It just happened')
  await B.fill('[role=dialog] input[maxlength="80"]', 'Pastel de nata stop')
  await B.fill('[role=dialog] textarea', 'Warm, flaky, gone in a minute.')
  await B.click('[role=dialog] button[role=radio]:has-text("WOW")')
  await B.click('[role=dialog] button[type=submit]')
  await A.waitForSelector('text=Pastel de nata stop', { timeout: 15000 })
  check('A: sees B surprise', true)
  await A.screenshot({ path: `${OUT}/c2-trip-A.png`, fullPage: true })

  // --- story page from server data ---
  await A.click('text=📖 Trip story →')
  await A.waitForTimeout(1200)
  const story = await A.locator('body').innerText()
  check('story: 2 lived, 1 surprise', /2\s*lived/.test(story) && /1\s*surprises/.test(story))
  check('story: divergence listed', story.includes('WOW · Zeynep') && story.includes('MEH') === true)
  await A.goBack()

  // --- reload keeps everything (server is the truth) ---
  await B.reload()
  await B.waitForSelector('text=Pastel de nata stop', { timeout: 20000 })
  check('B: data survives reload', await B.isVisible('text=Okay, it grew on me.'))

  // --- A deletes; B loses access ---
  await A.waitForSelector('text=Delete trip')
  await A.click('text=Delete trip')
  await A.click('text=Tap again to delete')
  await A.waitForSelector('text=No trips yet. Where to first?', { timeout: 15000 })
  await B.goto(URL)
  await B.waitForTimeout(2500)
  check('B: trip gone after delete', !(await B.isVisible('text=Cloud test trip')))

  check('no uncaught page errors', errors.length === 0, errors.join(' | '))
  console.log(results.join('\n'))
  await browser.close()
})().catch(async (e) => {
  console.log(results.join('\n'))
  console.error('CRASH', e.message.split('\n')[0])
  process.exit(1)
})
