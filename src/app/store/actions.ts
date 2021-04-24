import { createAction, props } from "@ngrx/store";
import { Action } from "rxjs/internal/scheduler/Action";


// export type IncrementAction = 'increment-counter';
// export type ComputeAction = 'compute';

type Actions = {
    incrementAction: 'increment-counter',
    computeAction: 'compute'
}
export const _actions: Actions = {

    incrementAction: 'increment-counter',
    computeAction: 'compute'
};


export const incrementCounterAction = createAction(_actions.incrementAction, props<{ kind: 'increment' }>());

export const computeAction = createAction(_actions.computeAction, props<{ kind: 'compute' }>());
