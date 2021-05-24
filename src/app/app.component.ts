import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as actions from './store/actions';



import { createSelector, createFeatureSelector, Store, select } from "@ngrx/store";
import { AppState, Compute, Groupings, Person } from './store/app-state';
import { Observable, pipe } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { identity } from 'lodash';
import { defaultContext, SelectContext, selectEngine } from './custom-select';

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





type Data = {
  items: Person[]
  selectedItems: Person[]
}

const selectItems = (appState: AppState) => appState.customSelect.items;
const selectSearchKey = (appState: AppState) => appState.customSelect.searchKeyword;
const selectSelectedNames = (appState: AppState) => appState.customSelect.selectedNames;
const selectGroupValue = (appState: AppState) => appState.customSelect.groupValue;

// lookup function
const lookup = (people: Person[], names: string[]) => {

  return _.flatMap(people, person => {
    return _.flatMap(names, name => {
      return (person.name === name) ? [person] : []
    })
  });
};
// helper functions
const flat = (xs: Person[] | _.Dictionary<Person[]>): Person[] => {
  if (xs instanceof Array) {
    return xs;
  } else {
    return  _.flatMap(xs, x => x);
  }
};
const toGroupValue = (groupCode: Groupings) => {

  switch (groupCode) {
    case 'all': { return '' }
    case 'active': { return 'Active' }
    case 'inactive': { return 'Inactive' }
  }
}
  
const customSelectSelector = createSelector(
  selectItems, selectSearchKey, selectSelectedNames, selectGroupValue,
    (items, searchKey, names, selectedGroupValue): Data => {

        console.log('[selector]', { searchKey, names, selectedGroupValue })

      const selectedItems = lookup(items, names);

      const context: SelectContext<Person> = {
        ...defaultContext(),
        sourceItems: items,
        selectedItems: selectedItems,
        
      };

    const processedItems = (searchKey === '')

      // EMPTY Search Criteria
      ? selectEngine({
        ...context,
        searchFunc: (person, groupKey) => selectedGroupValue === 'all'? true : person[groupKey] === toGroupValue(selectedGroupValue)
      }, 'status')

      // NON-EMPTY Search Criteria
      : selectEngine({
        ...context,
        searchFunc: (person, groupKey) => {

          const isSearchedInName = person.name.includes(searchKey);
          return (selectedGroupValue === 'all') ? isSearchedInName : isSearchedInName && person[groupKey] === toGroupValue(selectedGroupValue); 
        }
      }, 'status');

    return {
      items: flat(processedItems), // flatten for now
      selectedItems: selectedItems,
    };
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

  public data$: Observable<Data>;

  constructor(private store: Store<{ appState: AppState }>) {
    
  }

  ngOnInit() {

    // this.computeResult$ = this.store.pipe(
    //   map(({ appState }) => appState),
    //   tap(x => console.log('[before selector] compute result: ', x)),
    //   select(computeSelector),
    //   tap(x => console.log('[after selector] compute result: ', x)),
    //   );

    this.data$ = this.store.pipe(
      map(({ appState }) => appState),
      select(customSelectSelector)
    );
  }


  public compute() {

    this.store.dispatch(actions.computeAction({ kind: 'compute' }));
  }

  public select(person: Person) {

    this.store.dispatch(actions.addItems({ names: [person.name] }));
  }
  
  public remove(person: Person) {

    this.store.dispatch(actions.removeItems({ names: [person.name] }));
  }

  public loadItems() {

    this.store.dispatch(actions.loadItems({ kind: 'load-items'}));
  }

  public search(value: any) {

    this.store.dispatch(actions.search({ searchKeyword: value }));
  }

  public selectGroup(group: Groupings) {

    this.store.dispatch(actions.group({ groupValue: group }));
  }

  public addAllActive() {

    this.store.dispatch(actions.addAllActive());
  }
}
