# Code review findings

### 1. Code smells & improvements

#### 1.1 Code Smells
1. Store values should not be mutated and hence in `book-search.component.ts` there is a fix **implemented** for the same to consume an observable directly instead of making re-assignment in `ngOnInit()`. _This'd also mean that onInit is not required now in `book-search.component.ts`._

2. Not unsubscribing the `selector` in `book-search.component.ts` leads to potential memory leaks. **Used** `async` pipe to handle the same.

3. Redundant await should be avoided in `search-books.spec.ts`. _**Fixed** this SonarLint issue._

4. Naming conventions could have been more appropriate. For instance, using **b** in `b of books$` in `book-search.component.html` is an example of bad practice. This is now **updated** in this PR.

5. `formatDate()` in `book-search.component.ts` is not required as we can use `date` pipe notation directly in HTML to process the date in required format. **Removed `formatDate()`**. _Getting rid of this also helps in performance improvement since a pipe would evaluate only once & will re-use/fetch the value from last result._

#### 1.2 Suggested improvement areas
1. To have a better UX, we can provide a loader/spinner which'd show-up while API is fetching results. This is **implemented** as a part of Task 1.

2. Website is not following responsive design techniques which gives bad UX on smaller screens.

3. I'd also like to suggest a `route` for what I search, to have an ability to share direct link with anyone as a reference. For example, `http://localhost:4200/php`.

### 2. Accessibility

#### 2.1 Lighthouse's default scan results - _scored 87_
1. Buttons do not have an accessible name. **Fixed.**
    > When a button doesn't have an accessible name, screen readers announce it as "button", making it unusable for users who rely on screen readers.

2. Background and foreground colors do not have a sufficient contrast ratio. **Fixed.**
    > Low-contrast text is difficult or impossible for many users to read.

#### 2.2 Findings via manual check
1. `alt` attribute is a must-to-have _(following a good practice)_ and also to avoid an error in accessibility reports. This is missing in search results & in reading list pane as well. **Added.**

2. Using `<a>` tag is not recommended for elements which have an actionable event associated with it or it should at least have a role="button" in case `<a>` tag is a design requirement. **Fixed** - _changed `<a>` to `<span>` book-search.component.html_.

3. Screen-reader reads the `search icon` on page as _"button - scan"_; this is because of the incorrect form semantics. **Fixed.**

4. In search results, tabbing directly goes to "Want to Read" button after search icon - whereas to provide a proper understanding to people with special needs, a screen-reader should also announce the book details. **Enabled** this functionality as a part of fix and also to improvement keyboard usability.

5. Reading list's close icon is not read by a screen-reader. **Fixed.**
