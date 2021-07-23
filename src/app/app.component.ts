import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { identity, Observable, Subject } from 'rxjs';
import * as immutable from 'immutable';
import { map, takeUntil } from 'rxjs/operators';
import { createSelector, select, Store } from '@ngrx/store';
import { AppState } from './store/app-state';
import { loadItems } from './store/actions';

export type User = { id: number; name: string; phone: string };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {

  public users$: Observable<User[]>;

  public load$: Subject<void>;
  count = 0;

  private destroy$: Subject<void>;

  constructor(private store: Store<{appState: AppState}>) {}

  ngOnDestroy(): void {

    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
  
    this.load$ = new Subject();
    this.destroy$ = new Subject();

    const selectUser = (appState: AppState) => appState.users;
    const userSelector = createSelector(selectUser, identity);
    const users$ = this.store.pipe(
      map(({ appState }) => appState),
      select(userSelector)
    );

    this.users$ = users$;

    // Dispatch load items.
    this.load$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() =>
      this.store.dispatch(loadItems()));
  }

  traceRendering(view: string) {
    console.log('render' + view);
  }

  increment() {
    this.count++;
  }

  trackFunc(index, user: User) {
    return user.id;
  }
}
