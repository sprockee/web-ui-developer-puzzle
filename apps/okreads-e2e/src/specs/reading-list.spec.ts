import { $, $$, browser, By, element, ExpectedConditions } from 'protractor';

describe('When: I use the reading list feature', () => {
  it('Then: I should see my reading list', async () => {
    await browser.get('/');
    await browser.wait(
      ExpectedConditions.textToBePresentInElement($('tmo-root'), 'okreads')
    );

    await $('[data-testing="toggle-reading-list"]').click();

    await browser.wait(
      ExpectedConditions.textToBePresentInElement(
        $('[data-testing="reading-list-container"]'),
        'My Reading List'
      )
    );
  });


  it('Then: I should be able to mark a book as read', async () => {
    await $('[data-testing="close-reading-list"]').click();

    await $('input[type="search"]').sendKeys('Head First');
    await $('form').submit();

    await $$('[data-testing="want-to-read-btn"][ng-reflect-disabled="false"]').first().click();

    await $('[data-testing="toggle-reading-list"]').click();

    await $$('[data-testing="book-read-button"]').last().click();

    expect(
      ExpectedConditions.textToBePresentInElement($$('.reading-list-item .finished-on-date').last(),
      'Marked as read on:'
      )
    );
  });

  it('Then: I should be able to remove and add the same book again', async () => {
    await $$('.reading-list-item [data-testing="remove-finished-book"]').last().click();

    await $('[data-testing="close-reading-list"]').click();

    await $$('[data-testing="want-to-read-btn"][ng-reflect-disabled="false"]').first().click();

    await $('[data-testing="toggle-reading-list"]').click();

    await browser.wait(
      ExpectedConditions.presenceOf(
        element.all(By.className('mark-as-read')).last()
      )
    );
  });
  
});