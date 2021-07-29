import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject, identity, Observable, Subject } from 'rxjs';
import * as immutable from 'immutable';
import { map, scan, shareReplay, startWith, takeUntil, withLatestFrom } from 'rxjs/operators';
import { createSelector, select, Store } from '@ngrx/store';
import { AppState } from './store/app-state';
import { loadItems } from './store/actions';

export type User = { id: string; name: string; phone: string };

/**
 * Represents the commands that can be done to interact with View State
 * */
type Cmd = 'noop' | 'up' | 'down' | 'reset';

type ViewState = {
  selectedIndex: number,
  userId?: string
}
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

  public cmd$: BehaviorSubject<Cmd>;
  public selectedUser$: Subject<User['id']>;

  constructor(private store: Store<{appState: AppState}>) {}

  ngOnDestroy(): void {

    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
  
    this.load$ = new Subject();
    this.destroy$ = new Subject();

    this.cmd$ = new BehaviorSubject('noop');
    this.selectedUser$ = new Subject();

    const selectUser = (appState: AppState) => appState.users;
    const userSelector = createSelector(selectUser, identity);
    const users$ = this.store.pipe(
      map(({ appState }) => appState),
      select(userSelector),
      shareReplay()
    );

    this.users$ = users$;

    // Dispatch load items.
    this.load$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() =>
      this.store.dispatch(loadItems()));

    //#region UI State manipulation.
    //
    //
    // Note:
    //
    // - unique identifiers should represent the true state, it could happen that
    // there are remnants remaining in View State that are no longer in App State.
    // e.g, deleting an item, the item is no longer in the App State, but the View State is not done its work.
    //
    // - on complex animations / ui dom manipulation, it's important that
    // the change detection change are tracked, and all the required state are accumulated
    // this prevents the UI to respond in unexpected way for every signal.


    const userIds$ = users$
      .pipe(
        // map to unique identifiers
        map(us => us.map(u => u.id))
        /**
         * flatten/fold/reduce data structure to **total order** | foldFunction,
         * 
         * In our scenario we track the order of the elements
         *  so the index is all we need.
         * 
         * in this case, its identity.
         * */
        , map(uids => uids)
        );

    const initS: ViewState = {
      selectedIndex: 0,
      userId: null
    };

    const nextSelectedViewState = (
      context: {
        currentViewState: ViewState
        , userId: User['id']
        , nextSelectedIndex: number
      }) => {

      const {
        currentViewState
        , userId
        , nextSelectedIndex
      } = context;

      if (userId) {

        return {
          selectedIndex: nextSelectedIndex,
          userId: userId
        };
      } else {
      
        return {
          selectedIndex: currentViewState.selectedIndex,
          userId: null
        };
      }
    };

    // Accumulate View State
    this.cmd$
    .pipe(
      withLatestFrom(userIds$), // query from true state.
      scan((viewState, [cmd, userIds]) => {

        switch (cmd) {
          case 'down': {

            const nextSelectedIndex = viewState.selectedIndex + 1;
            const foundUserId =  userIds.find((u, i) => i == nextSelectedIndex);

            return nextSelectedViewState({
              currentViewState: viewState
              , userId: foundUserId
              , nextSelectedIndex}
              );
          }
          case 'up': {

            const topmostUserId =  userIds.find((u, i) => i == 0);

            const nextSelectedIndex = viewState.selectedIndex - 1;
            const foundUserId =  userIds.find((u, i) => i == nextSelectedIndex);

            return {
              selectedIndex: nextSelectedIndex < 0 ? 0 : nextSelectedIndex,
              userId: foundUserId ? foundUserId : topmostUserId
            };
          }
          case 'noop': {

            // select first.
            const nextSelectedIndex = 0;
            const foundUserId =  userIds.find((u, i) => i == nextSelectedIndex);

            return {
              selectedIndex: nextSelectedIndex,
              userId: foundUserId
            };
          }
          case 'reset': {

            // select first.
            const nextSelectedIndex = 0;
            const foundUserId =  userIds.find((u, i) => i == nextSelectedIndex);

            return {
              selectedIndex: nextSelectedIndex,
              userId: foundUserId
            };
          }
          default: {

            throw new Error("mismatch cmd")
          }
        }
      }, initS),
      startWith(initS),
      takeUntil(this.destroy$)
    )
    .subscribe(vs => {

      console.log('view state', vs);
      this.selectedUser$.next(vs.userId);
    });
    //#endregion
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

  load() {

    this.load$.next();
    this.cmd$.next('reset');
  }

}
