// Trip story checks against hand-computed demo numbers.
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core')
const OUT = process.argv[2]
const URL = 'http://localhost:4399'
const results = []
const check = (name, ok, extra = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`)

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
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.click('text=Reset demo')
  await page.click('text=Paris weekend')
  await page.click('text=📖 Trip story →')
  await page.waitForURL(/\/story$/)
  await page.waitForTimeout(1200)
  const text = await page.locator('body').innerText()
  const has = (s) => text.includes(s)

  check('subtitle "So far" while live', has('Trip story · So far'))
  check('stats 6 lived / 2 surprises / 3 ahead',
    /6\s*lived/.test(text) && /2\s*surprises/.test(text) && /3\s*still ahead/.test(text))
  check('verdicts WOW 7 / AS HOPED 4 / MEH 1', has('WOW 7') && has('AS HOPED 4') && has('MEH 1'))
  check('money planned ~122€ spent 136€ +14€', has('~122€') && has('136€') && has('+14€'))
  check('4 plans compared', has('per person, 4 plans compared'))
  check('surprises ~26€', has('Surprises added ~26€ each'))
  const hl = page.locator('section', { hasText: 'THE HIGHLIGHT' })
  check('highlight = Eiffel, quoted by Zeynep',
    (await hl.innerText()).includes('Eiffel Tower at sunset') && (await hl.innerText()).includes('Zeynep · 3 voices'))
  const sur = page.locator('section', { hasText: 'BIGGEST SURPRISE' })
  check('biggest surprise = crepe', (await sur.innerText()).includes('Crepe stand near the river'))
  const div = page.locator('section', { hasText: 'SEEN DIFFERENTLY' })
  const divText = await div.innerText()
  check('divergence Louvre WOW Mike / MEH Zeynep',
    divText.includes('Louvre Museum') && divText.includes('WOW · Mike') && divText.includes('MEH · Zeynep'))
  check('no "stayed plans" section while live', !has('PLANS THAT STAYED PLANS'))
  const voices = await page.locator('section', { hasText: 'WHO TOLD THE STORY' }).innerText()
  check('voices Alex 5, Zeynep 4, Mike 3',
    /Alex\s*5 voices/.test(voices) && /Zeynep\s*4 voices/.test(voices) && /Mike\s*3 voices/.test(voices), voices.replace(/\n/g, ' '))
  await page.screenshot({ path: `${OUT}/8-story-live.png`, fullPage: true })

  // Move the demo trip 10 days into the past -> reflecting
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('twofold-data'))
    const d = new Date(); d.setDate(d.getDate() - 10)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    raw.state.trips[0].start_date = iso
    localStorage.setItem('twofold-data', JSON.stringify(raw))
  })
  await page.reload()
  await page.waitForTimeout(1200)
  const t2 = await page.locator('body').innerText()
  check('nudge after trip', t2.includes('Paris weekend is done. Some moments are still unrecorded.'))
  check('3 stayed plans', /3\s*stayed plans/.test(t2))
  const ghosts = await page.locator('section', { hasText: 'PLANS THAT STAYED PLANS' }).innerText()
  check('ghost list', ghosts.includes('Picnic at Trocadéro') && ghosts.includes('Montmartre wander') && ghosts.includes('Sacré-Cœur at sunset'))
  check('no "So far" after trip', !t2.includes('So far'))
  await page.screenshot({ path: `${OUT}/9-story-after.png`, fullPage: true })

  // Home shows Memories badge, trip page shows ghost cards
  await page.goto(URL)
  check('home badge Memories', await page.isVisible('a:has-text("Paris weekend") >> text=Memories'))

  // TR story page
  await page.click('text=Paris weekend')
  await page.click('button[aria-label="Switch language to TR"]')
  await page.click('text=📖 Seyahat hikâyesi →')
  await page.waitForTimeout(1000)
  const t3 = await page.locator('body').innerText()
  check('TR story', t3.includes('PLANDA KALANLAR') && t3.includes('Paris weekend bitti.'))
  await page.screenshot({ path: `${OUT}/10-story-tr.png`, fullPage: true })
  await page.click('button[aria-label="Switch language to EN"]')

  // Empty trip story + singular plural
  await page.goto(URL)
  await page.click('button[aria-label="+ New Trip"]')
  await page.fill('[role=dialog] input[maxlength="60"]', 'Day in Bursa')
  await page.click('[role=dialog] button[aria-label="−"]')
  await page.click('[role=dialog] button[aria-label="−"]')
  await page.click('[role=dialog] button[type=submit]')
  await page.waitForURL(/\/trip\//)
  check('singular "1 day, 1 soul"', await page.isVisible('text=1 day, 1 soul'))
  await page.click('text=📖 Trip story →')
  check('empty story message', await page.isVisible('text=Nothing lived yet. The story starts with the first moment.'))

  await page.goto(URL + '/trip/nope/story')
  check('unknown trip story', await page.isVisible('text=This trip does not exist anymore.'))

  await page.evaluate(() => localStorage.clear())
  check('no console/page errors', errors.length === 0, errors.join(' | '))
  console.log(results.join('\n'))
  await browser.close()
})().catch((e) => {
  console.log(results.join('\n'))
  console.error('CRASH', e.message)
  process.exit(1)
})
