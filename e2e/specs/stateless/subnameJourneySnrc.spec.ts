import { expect } from '@playwright/test'

import { test } from '../../../playwright'

/*
 * SNRC end-to-end journey on a single .testing 2LD:
 *   1. register the 2LD through the UI (NFT-gated, free; account #0 holds the gate NFT)
 *   2. add a `simplex.contact` record to the 2LD
 *   3. create a subname (mobile.<2LD>) — soulbound to the 2LD NFT
 *   4. add a `simplex.contact` record to the subname
 *   5. delete the subname
 *
 * `simplex.contact` is the MultiUrlField record (CSV of SMP-server URLs); the
 * field test-ids are `multi-url-field-simplex.contact-*`.
 */

const CONTACT_KEY = 'simplex.contact'
const contactInput = (page: any, i = 0) =>
  page.getByTestId(`multi-url-field-${CONTACT_KEY}-input-${i}`)

test('SNRC: register 2LD, add simplex.contact to 2LD + subname, then delete the subname', async ({
  page,
  login,
  time,
  makePageObject,
}) => {
  test.slow()

  const label = `foobar-${Date.now().toString(36)}`
  const name = `${label}.testing`
  const subLabel = 'mobile'
  const subname = `${subLabel}.${name}`

  const homePage = makePageObject('HomePage')
  const profilePage = makePageObject('ProfilePage')
  const subnamesPage = makePageObject('SubnamesPage')
  const recordsPage = makePageObject('RecordsPage')
  const transactionModal = makePageObject('TransactionModal')

  await time.sync()
  await homePage.goto()
  await login.connect()

  await test.step('register the 2LD', async () => {
    await homePage.searchInput.fill(name)
    await page.locator(`[data-testid="search-result-name"]`, { hasText: name }).waitFor()
    await page.locator(`[data-testid="search-result-name"]`, { hasText: 'Available' }).waitFor()
    await homePage.searchInput.press('Enter')
    await expect(page.getByRole('heading', { name: `Register ${name}` })).toBeVisible({
      timeout: 90000,
    })
    const next = page.getByTestId('next-button')
    await expect(next).toBeEnabled({ timeout: 30000 })
    await next.click()
    await page.getByTestId('profile-submit-button').click()
    await expect(page.getByTestId('next-button')).toHaveText('Begin')
    await page.getByTestId('next-button').click()
    await expect(transactionModal.transactionModal).toBeVisible({ timeout: 30000 })
    await transactionModal.closeButton.click()
    await page.getByTestId('start-timer-button').click()
    await transactionModal.confirm()
    await time.sync()
    await time.increaseTime({ seconds: 90 })
    await expect(page.getByTestId('finish-button')).toBeEnabled({ timeout: 30000 })
    await page.getByTestId('finish-button').click()
    await transactionModal.confirm()
    await expect(page.getByText(`You are now the owner of ${name}`)).toBeVisible({ timeout: 60000 })
  })

  await test.step('add simplex.contact to the 2LD', async () => {
    await profilePage.goto(name)
    await profilePage.editProfileButton.click()
    await profilePage.profileEditorAddInputs([CONTACT_KEY])
    await expect(contactInput(page)).toBeVisible()
    await contactInput(page).fill('https://smp1.example.im/2ld#H1')
    await profilePage.profileEditor.getByTestId('profile-submit-button').click()
    await transactionModal.autoComplete()

    await recordsPage.goto(name)
    await expect(recordsPage.getRecordValue('text', CONTACT_KEY)).toHaveText(
      'https://smp1.example.im/2ld#H1',
    )
  })

  await test.step('create the subname', async () => {
    await subnamesPage.goto(name)
    await subnamesPage.getAddSubnameButton.click()
    await subnamesPage.getAddSubnameInput.fill(subLabel)
    await subnamesPage.getSubmitSubnameButton.click()
    // skip the optional records step of subname creation
    await subnamesPage.getSubmitSubnameProfileButton.click()
    await transactionModal.autoComplete()
    await expect(page).toHaveURL(new RegExp(subname.replace(/\./g, '\\.')), { timeout: 30000 })
  })

  await test.step('add simplex.contact to the subname', async () => {
    await profilePage.goto(subname)
    await profilePage.editProfileButton.click()
    await profilePage.profileEditorAddInputs([CONTACT_KEY])
    await expect(contactInput(page)).toBeVisible()
    await contactInput(page).fill('https://smp1.example.im/sub#H1')
    await profilePage.profileEditor.getByTestId('profile-submit-button').click()
    await transactionModal.autoComplete()

    await recordsPage.goto(subname)
    await expect(recordsPage.getRecordValue('text', CONTACT_KEY)).toHaveText(
      'https://smp1.example.im/sub#H1',
    )
  })

  await test.step('delete the subname', async () => {
    await profilePage.goto(subname)
    await page.getByTestId('profile-action-Delete subname').click()
    await transactionModal.autoComplete()

    // The subname should no longer be listed under the 2LD.
    await subnamesPage.goto(name)
    await expect(page.getByTestId(`name-item-${subname}`)).toHaveCount(0, { timeout: 30000 })
  })
})
