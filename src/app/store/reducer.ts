import { createReducer, on } from '@ngrx/store';
import * as _ from 'lodash';
import { AppState, initialState } from './app-state';
import * as actions from './actions';


const _appReducer = createReducer(
    initialState,

    on(actions.loadItemsSucceed, (appState: AppState, { users }): AppState => {

        return {
            ...appState,
            users: users
        };
    }),
    
    on(actions.loadItemsFailed, (appState: AppState): AppState => {

        console.error("failed to load user");
        return appState;
    }),

    on(actions.valueChange, (appState: AppState): AppState => {

        return appState;
    }),

);

export function appReducer(state, action) {
	return _appReducer(state, action);
}
