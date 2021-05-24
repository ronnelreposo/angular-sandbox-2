import { createAction, props } from "@ngrx/store";
import { Action } from "rxjs/internal/scheduler/Action";
import { Groupings, Person } from "./app-state";


// export type IncrementAction = 'increment-counter';
// export type ComputeAction = 'compute';

type Actions = {
    incrementAction: 'increment-counter',
    computeAction: 'compute',
    customSelectActions: {
        loadItems: '[custom-select] load items',
        addItems: '[custom-select] add-items',
        removeItems: '[custom-select] remove-items',
        search: '[custom-select] search',
        group: '[custom-select] group',
        clearAllSelected: '[custom-select] clear all selected items',
        addAllActive: '[custom-select] add all active'
    }
}
export const _actions: Actions = {

    incrementAction: 'increment-counter',
    computeAction: 'compute',
    customSelectActions: {
        loadItems: '[custom-select] load items',
        addItems: '[custom-select] add-items',
        removeItems: '[custom-select] remove-items',
        search: '[custom-select] search',
        group: '[custom-select] group',
        clearAllSelected: '[custom-select] clear all selected items',
        addAllActive: '[custom-select] add all active',
    }
};


export const incrementCounterAction = createAction(_actions.incrementAction, props<{ kind: 'increment' }>());

export const computeAction = createAction(_actions.computeAction, props<{ kind: 'compute' }>());

// Custom Select Action.
export const loadItems = createAction(_actions.customSelectActions.loadItems, props<{kind: 'load-items'}>());
export const addItems = createAction(_actions.customSelectActions.addItems, props<{ names: Person['name'][] }>()); // assumed to be unique.
export const removeItems = createAction(_actions.customSelectActions.removeItems, props<{ names: Person['name'][] }>()); // assumed to be unique.
export const search = createAction(_actions.customSelectActions.search, props<{ searchKeyword: string }>());
export const group = createAction(_actions.customSelectActions.group, props<{ groupValue: Groupings }>()); // string for now.
export const clearAllSelected = createAction(_actions.customSelectActions.clearAllSelected);
// domain specific add selection.
export const addAllActive = createAction(_actions.customSelectActions.addAllActive);
