import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReplaySubject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { createBook, createReadingListItem, SharedTestingModule } from '@tmo/shared/testing';
import { ReadingListEffects } from './reading-list.effects';
import * as ReadingListActions from './reading-list.actions';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TypedAction } from '@ngrx/store/src/models';
import { Book, ReadingListItem } from '@tmo/shared/models';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ToReadEffects', () => {
  let actions: ReplaySubject<any>;
  let effects: ReadingListEffects;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule, NoopAnimationsModule, MatSnackBarModule],
      providers: [
        ReadingListEffects,
        provideMockActions(() => actions),
        provideMockStore()
      ]
    });

    effects  = TestBed.inject(ReadingListEffects);
    httpMock = TestBed.inject(HttpTestingController);

    actions = new ReplaySubject();
  });

  describe('loadReadingList$', () => {
    it('should work', done => {
      actions = new ReplaySubject();
      actions.next(ReadingListActions.init());

      effects.loadReadingList$.subscribe(action => {
        expect(action).toEqual(
          ReadingListActions.loadReadingListSuccess({ list: [] })
        );
        done();
      });

      httpMock.expectOne('/api/reading-list').flush([]);
    });
  });

  describe('addBook$', () => {
    let book: Book;

    beforeEach(() => {
      book = createBook('A');
    });

    it('it should ADD a book to the reading list successfully and snackbar should appear', () => {
      actions.next(ReadingListActions.addToReadingList({ book, showSnackBar: true }));

      effects.addBook$.subscribe(fakeAsync((action: TypedAction<string>) => {
        /*
         * 'tick()' is required as to fulfil the below mentioned 'expect()' statement
         * 'confirmedAddToReadingList' doesn't execute till the time snackbar is present
        */
        tick(5000);
        expect(action).toEqual(
          ReadingListActions.confirmedAddToReadingList({ book })
        );
        expect(document.querySelector('simple-snack-bar')).toBeTruthy();
        /*
          * Snackbar needs to be removed from DOM once except() statement is validated
          * This is also required for the negative use case to execute rightly
        */
        document.querySelector('simple-snack-bar').remove();
      }));

      httpMock.expectOne('/api/reading-list').flush({});
    });

    it('it should UNDO the recently removed book successfully, back in the list and snackbar should not appear', done => {
      actions.next(ReadingListActions.addToReadingList({ book, showSnackBar: false }));

      effects.addBook$.subscribe(action => {
        expect(action).toEqual(
          ReadingListActions.confirmedAddToReadingList({ book })
        );
        expect(document.querySelector('simple-snack-bar')).toBeFalsy();
        done();
      });

      httpMock.expectOne('/api/reading-list').flush({});
    });

    it('it should dispatch failedAddToReadingList action when API returns error response and snackbar should not appear', done => {
      actions.next(ReadingListActions.addToReadingList({ book, showSnackBar: false }));

      effects.addBook$.subscribe(action => {
        expect(action).toEqual(
          ReadingListActions.failedAddToReadingList({ book })
        );
        expect(document.querySelector('simple-snack-bar')).toBeFalsy();
        done();
      });

      httpMock.expectOne('/api/reading-list').flush({}, { status: 500, statusText: 'server error' });
    });
  });

  describe('removeBook$', () => {
    let item: ReadingListItem;

    beforeEach(() => {
      item = createReadingListItem('A');
    });

    it('it should REMOVE a book from the reading list successfully and snackbar should appear', () => {
      actions = new ReplaySubject();
      actions.next(ReadingListActions.removeFromReadingList({ item, showSnackBar: true }));

      effects.removeBook$.subscribe(fakeAsync((action: TypedAction<string>) => {
        tick(5000);
        expect(action).toEqual(
          ReadingListActions.confirmedRemoveFromReadingList({ item })
        );
        expect(document.querySelector('simple-snack-bar')).toBeTruthy();
        document.querySelector('simple-snack-bar').remove();
      }));

      httpMock.expectOne(`/api/reading-list/${item.bookId}`).flush({});
    });

    it('it should UNDO the recently added book successfully, from the reading list and snackbar should not appear', done => {
      actions.next(ReadingListActions.removeFromReadingList({ item, showSnackBar: false }));

      effects.removeBook$.subscribe(action => {
        expect(action).toEqual(
          ReadingListActions.confirmedRemoveFromReadingList({ item })
        );
        expect(document.querySelector('simple-snack-bar')).toBeFalsy();
        done();
      });
      httpMock.expectOne(`/api/reading-list/${item.bookId}`).flush({});
    });

    it('it should dispatch failedRemoveFromReadingList action when API returns error response and snackbar should not appear', done => {
      actions.next(ReadingListActions.removeFromReadingList({ item, showSnackBar: false }));

      effects.removeBook$.subscribe(action => {
        expect(action).toEqual(
          ReadingListActions.failedRemoveFromReadingList({ item })
        );
        expect(document.querySelector('simple-snack-bar')).toBeFalsy();
        done();
      });

      httpMock.expectOne(`/api/reading-list/${item.bookId}`).flush({}, { status: 500, statusText: 'server error' });
    });
  });
});
