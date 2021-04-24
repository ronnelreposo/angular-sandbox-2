import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as actions from './store/actions';



import { createSelector, createFeatureSelector, Store, select } from "@ngrx/store";
import { AppState, Compute } from './store/app-state';
import { Observable, pipe } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { identity } from 'lodash';

// Select Top Level Feature States.
const computeFeatureSelector = createFeatureSelector<AppState, Compute>("compute");
const counterFeatureSelector = createFeatureSelector<AppState, AppState['counter']>("counter");

// const computeSelector = createSelector(
//   counterFeatureSelector,
//   computeFeatureSelector,
//   (counter, compute) => compute.result.reduce((a, b) => a + b, 0)
// );




// Without feature selector =================================================================

// // Select Top Level States.
const selectCounter = (appState: AppState) => appState.counter;
const selectCompute = (appState: AppState) => appState.compute;

const computeSelector = createSelector(selectCounter, selectCompute, (counter, compute) => {

  // process data for view.
  return compute.result.reduce((a, b) => a + b, 0);
});

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {

  // computeResult$: Observable<number[]>
  computeResult$: Observable<any>

  constructor(private store: Store<{ appState: AppState }>) {
    
  }

  ngOnInit() {

    this.computeResult$ = this.store.pipe(
      map(({ appState }) => appState),
      tap(x => console.log('[before selector] compute result: ', x)),
      select(computeSelector),
      tap(x => console.log('[after selector] compute result: ', x)),
      );
  }


  public compute() {

    this.store.dispatch(actions.computeAction({ kind: 'compute' }));
  }

}
