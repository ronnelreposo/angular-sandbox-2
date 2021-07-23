import { createAction, props } from "@ngrx/store";
import { User } from "../app.component";
import * as immutable from 'immutable';


// export type IncrementAction = 'increment-counter';
// export type ComputeAction = 'compute';

type Actions = {
    loadItems: 'load items',
    loadItemsSucceed: 'load items: failed',
    loadItemsFailed: 'load items: succeed',
    valueChanges: 'value change' 
}
export const _actions: Actions = {
    loadItems: 'load items',
    loadItemsSucceed: 'load items: failed',
    loadItemsFailed: 'load items: succeed',
    valueChanges: 'value change' 
};

export const loadItems = createAction(_actions.loadItems);
export const loadItemsSucceed = createAction(_actions.loadItemsSucceed,
    props<{ users: immutable.List<User> }>());
export const loadItemsFailed = createAction(_actions.loadItemsFailed);
export const valueChange = createAction(_actions.valueChanges, props<{ changedUser: User }>());
