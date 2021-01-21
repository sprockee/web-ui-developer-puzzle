import { TestBed } from '@angular/core/testing';
import { ReplaySubject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { createReadingListItem, SharedTestingModule } from '@tmo/shared/testing';
import { ReadingListEffects } from './reading-list.effects';
import * as ReadingListActions from './reading-list.actions';

describe('ToReadEffects', () => {
  let actions: ReplaySubject<any>;
  let effects: ReadingListEffects;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
      providers: [
        ReadingListEffects,
        provideMockActions(() => actions),
        provideMockStore()
      ]
    });

    effects = TestBed.inject(ReadingListEffects);
    httpMock = TestBed.inject(HttpTestingController);
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

  describe('finishedReading$', () => {
    it('should mark the book as read on the given date', done => {
      const readingListItem = createReadingListItem('A');
      const finishedDate = new Date().toISOString();
      actions = new ReplaySubject();
      actions.next(
        ReadingListActions.markedAsRead({ item: readingListItem, finishedDate })
      );
      effects.finishedReading$.subscribe(action => {
        expect(action).toEqual(ReadingListActions.confirmedToMarkAsRead());
        done();
      });
      httpMock
        .expectOne(`/api/reading-list/${readingListItem.bookId}/finished`)
        .flush({});
    });

    it('should not mark the book as read due to API server issues', (done) => {
      const readingListItem = createReadingListItem('B');
      const finishedDate = new Date().toISOString();

      actions = new ReplaySubject();
      actions.next(
        ReadingListActions.markedAsRead({
          item: readingListItem,
          finishedDate,
        })
      );

      effects.finishedReading$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.failedToMarkAsRead({
            item: readingListItem,
            finishedDate: '',
          })
        );
        done();
      });

      httpMock
        .expectOne(`/api/reading-list/${readingListItem.bookId}/finished`)
        .flush({}, { status: 403, statusText: 'Forbidden' });
    });
  });
});
