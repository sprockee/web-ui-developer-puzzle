import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  addToReadingList,
  clearSearch,
  getAllBooks,
  ReadingListBook,
  searchBooks
} from '@tmo/books/data-access';
import { FormBuilder } from '@angular/forms';
import { Book } from '@tmo/shared/models';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/internal/operators';

@Component({
  selector: 'tmo-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.scss']
})
export class BookSearchComponent implements OnInit, OnDestroy {
  books$: Observable<ReadingListBook[]> = this.store.select(getAllBooks);

  searchForm = this.fb.group({
    term: ''
  });

  private ngDeregister = new Subject<boolean> ();

  constructor(
    private readonly store: Store,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.searchForm.get('term').valueChanges.pipe(
      debounceTime(500), 
      distinctUntilChanged(),
      takeUntil(this.ngDeregister))
      .subscribe(() => this.searchBooks());
  }

  ngOnDestroy(): void {
    this.ngDeregister.next();
    this.ngDeregister.complete();
  }

  get searchTerm(): string {
    return this.searchForm.value.term;
  }

  addBookToReadingList(book: Book) {
    this.store.dispatch(addToReadingList({ book }));
  }

  searchExample() {
    this.searchForm.controls.term.setValue('javascript');
  }

  searchBooks() {
    if (this.searchForm.value.term) {
      this.store.dispatch(searchBooks({ term: this.searchTerm }));
    } else {
      this.store.dispatch(clearSearch());
    }
  }
}
