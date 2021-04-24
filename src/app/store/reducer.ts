import { createReducer, on } from '@ngrx/store';
import * as _ from 'lodash';
import { AppState, initialState } from './app-state';
import * as actions from './actions';


const _appReducer = createReducer(
    initialState,
    on(actions.incrementCounterAction, (appState: AppState, { kind }): AppState => {

            return {
                ...appState,
                counter: appState.counter + 1
            }
        }),
    on(actions.computeAction, (appState: AppState, { kind }): AppState => {

            const parameters: AppState['compute']['parameters'] = {
                x: Math.random(),
                y: Math.random(),
            };
            return {
                ...appState,
                compute: {
                    parameters: parameters,
                    // result: parameters.x + parameters.y
                    result: [ (parameters.x + parameters.y), (parameters.x + parameters.y) ]
                }
            }
        })
);

export function appReducer(state, action) {
	return _appReducer(state, action);
}
