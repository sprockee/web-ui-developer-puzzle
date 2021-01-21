import { $, $$, browser, ExpectedConditions } from 'protractor';

describe('When: Use the search feature', () => {
  /*
    * disabling this test case since it's not required now with instant search implementation
  */
  xit('Then: I should be able to search books by title', async () => {
    await browser.get('/');
    await browser.wait(
      ExpectedConditions.textToBePresentInElement($('tmo-root'), 'okreads')
    );

    const form = $('form');
    const input = $('input[type="search"]');
    await input.sendKeys('javascript');
    await form.submit();

    const items = await $$('[data-testing="book-item"]');
    expect(items.length).toBeGreaterThan(1);
  });

  it('Then: I should see search results as I am typing', async () => {
    await browser.get('/');
    await browser.wait(
      ExpectedConditions.textToBePresentInElement($('tmo-root'), 'okreads')
    );

    const input = $('input[type="search"]');
    await input.sendKeys('Head First'); // search term

    const items = await $$('[data-testing="book-item"]');
    expect(items.length).toBeGreaterThan(1, 'At least one book');
  });
});
