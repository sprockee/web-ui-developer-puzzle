import { $, $$, browser, By, ExpectedConditions } from 'protractor';

describe('When: I use the reading list feature', () => {
  beforeEach(async () => {
    await browser.get('/');
    await browser.wait(
      ExpectedConditions.textToBePresentInElement($('tmo-root'), 'okreads')
    );
  });

  it('Then: I should see my reading list', async () => {
    await $('[data-testing="toggle-reading-list"]').click();

    await browser.wait(
      ExpectedConditions.textToBePresentInElement(
        $('[data-testing="reading-list-container"]'),
        'My Reading List'
      )
    );
  });

  it('Then: I should be able to UNDO adding a book to my reading list', async () => {
    await $('input[type="search"]').sendKeys('head first');
    await $('form').submit();

    await $('[data-testing="toggle-reading-list"]').click();
    const initialReadingListCount  = await $$('.reading-list-item');
    await $('[data-testing="close-reading-list"]').click();

    await $$('[data-testing="want-to-read-btn"]').first().click();

    await browser.driver.findElement(By.className('mat-simple-snackbar-action')).click();

    await $('[data-testing="toggle-reading-list"]').click();

    const finalReadingListCount = await $$('.reading-list-item');
    expect(finalReadingListCount.length).toEqual(initialReadingListCount.length);
  });

  it('Then: I should be able to UNDO removing a book from my reading list', async () => {
    await $('input[type="search"]').sendKeys('head first');
    await $('form').submit();

    await $$('[data-testing="want-to-read-btn"]').first().click();

    await $('[data-testing="toggle-reading-list"]').click();
    const initialReadingListCount = await $$('.reading-list-item');

    await $('tmo-reading-list button').click();
    await browser.driver.findElement(By.className('mat-simple-snackbar-action')).click();
    
    const finalReadingListCount = await $$('.reading-list-item');
    expect(finalReadingListCount.length).toEqual(initialReadingListCount.length);
  });
});
