import { createReducer, on } from '@ngrx/store';
import * as _ from 'lodash';
import { AppState, initialState } from './app-state';
import * as actions from './actions';
import * as immutable from 'immutable';
import { User } from '../app.component';

const updateUserOnLookup = (usersSource: immutable.List<User>, changedUser: User) => {
    return usersSource.update(
        usersSource.findIndex(
            user => user.id === changedUser.id
        ),
        user => changedUser
    );
};
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

    on(actions.valueChange,
        (appState: AppState, { changedUser: changedUser }): AppState => {

        const updatedUsers = updateUserOnLookup(
            appState.users, changedUser
        );

        return {
            ...appState,
            users: updatedUsers
        }
    }),

);

export function appReducer(state, action) {
	return _appReducer(state, action);
}
