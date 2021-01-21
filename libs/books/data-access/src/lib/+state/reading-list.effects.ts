import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, exhaustMap, map } from 'rxjs/operators';
import { ReadingListItem } from '@tmo/shared/models';
import * as ReadingListActions from './reading-list.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';

@Injectable()
export class ReadingListEffects implements OnInitEffects {
  loadReadingList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.init),
      exhaustMap(() =>
        this.http.get<ReadingListItem[]>('/api/reading-list').pipe(
          map((data) =>
            ReadingListActions.loadReadingListSuccess({ list: data })
          ),
          catchError((error) =>
            of(ReadingListActions.loadReadingListError({ error }))
          )
        )
      )
    )
  );

  addBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.addToReadingList),
      concatMap(({ book, showSnackBar }) =>
        this.http.post('/api/reading-list', book).pipe(
          map(() => {
            if (showSnackBar) {
              const addBookSnackBar = this.snackBar.open(
                `"${book.title}" added successfully to your reading list.`,
                'Undo',
                { duration: 5000 }
              );
              addBookSnackBar
                .afterDismissed()
                .subscribe(bookSnackBar => {
                  if (bookSnackBar.dismissedByAction) {
                    this.store.dispatch(ReadingListActions.removeFromReadingList({
                      item: {
                        bookId: book.id,
                        ...book
                      },
                      showSnackBar: false
                    }))
                  }
              });
            }
            return ReadingListActions.confirmedAddToReadingList({ book });
          }),
          catchError(() =>
            of(ReadingListActions.failedAddToReadingList({ book }))
          )
        )
      )
    )
  );

  removeBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.removeFromReadingList),
      concatMap(({ item, showSnackBar }) =>
        this.http.delete(`/api/reading-list/${item.bookId}`).pipe(
          map(() => {
            if (showSnackBar) {
              const removeBookSnackBar = this.snackBar.open(
                `"${item.title}" removed successfully from your reading list.`, 
                'Undo', 
                { duration: 5000 }
              );
              removeBookSnackBar
                .afterDismissed()
                .subscribe(bookSnackBar => {
                  if (bookSnackBar.dismissedByAction) {
                    this.store.dispatch(ReadingListActions.addToReadingList({
                      book: {
                        id: item.bookId,
                        ...item
                      },
                      showSnackBar: false
                    }))
                  }
              });
            }
            return ReadingListActions.confirmedRemoveFromReadingList({ item });
          }),
          catchError(() =>
            of(ReadingListActions.failedRemoveFromReadingList({ item }))
          )
        )
      )
    )
  );

  ngrxOnInitEffects() {
    return ReadingListActions.init();
  }

  constructor(private actions$: Actions, private http: HttpClient, private snackBar: MatSnackBar, private store: Store) {}
}
