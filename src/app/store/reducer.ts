import { createReducer, on } from '@ngrx/store';
import * as _ from 'lodash';
import { AppState, initialState, Person } from './app-state';
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
        }),

    on(actions.loadItems, (appState: AppState): AppState => {


        const people: Person[] = [
            { name: 'Adam', email: 'adam@email.com', age: 12, country: 'United States', status: 'Active' },
            { name: 'Homer', email: 'homer@email.com', age: 47, country: '', status: 'Active' },
            { name: 'Samantha', email: 'samantha@email.com', age: 30, country: 'United States', status: 'Active' },
            { name: 'Amalie', email: 'amalie@email.com', age: 12, country: 'Argentina', status: 'Active' },
            { name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina', status: 'Active' },
            { name: 'Adrian', email: 'adrian@email.com', age: 21, country: 'Ecuador', status: 'Active' },
            { name: 'Wladimir', email: 'wladimir@email.com', age: 30, country: 'Ecuador', status: 'Inactive' },
            { name: 'Natasha', email: 'natasha@email.com', age: 54, country: 'Ecuador', status: 'Inactive' },
            { name: 'Nicole', email: 'nicole@email.com', age: 43, country: 'Colombia', status: 'Inactive' },
            { name: 'Michael', email: 'michael@email.com', age: 15, country: 'Colombia', status: 'Inactive' },
            { name: 'Nicolás', email: 'nicole@email.com', age: 43, country: 'Colombia', status: 'Inactive' }
        ];

        console.log('[reducer] loaditems', appState)

        return {
            ...appState,
            customSelect: {
                ...appState.customSelect,
                groupValue: 'all',
                items: people
            }
        };
    }),
    on(actions.addItems, (appState: AppState, { names }): AppState => {
        
        return {
            ...appState,
            customSelect: {
                ...appState.customSelect,
                selectedNames: [ ...appState.customSelect.selectedNames, ...names ],
            }
        };
    }),
    on(actions.removeItems, (appState: AppState, { names }): AppState => {

        return {
            ...appState,
            customSelect: {
                ...appState.customSelect,
                selectedNames: _.difference(appState.customSelect.selectedNames, names),
            }
        };
    }),
    on(actions.search, (appState: AppState, { searchKeyword: searchKeyword }): AppState => {

        return {
            ...appState,
            customSelect: {
                ...appState.customSelect,
                searchKeyword: searchKeyword,
            }
        };
    }),
    on(actions.group, (appState: AppState, { groupValue: groupValue }): AppState => {

        return {
            ...appState,
            customSelect: {
                ...appState.customSelect,
                groupValue: groupValue
            }
        };
    }),
    on(actions.addAllActive, (appState: AppState): AppState => {

        // Get all the active users.
        const activeNames = appState.customSelect.items
            .filter(item => item.status === 'Active')
            .map(item => item.name);

        // Question. Why not pick all the active names? why do we need to union from the selected names?
        // Answer. This is to demonstrate on how to combine items that are already selected and
        //  all the items from the lookup, it could happen that the business domain requires custom equality
        //  in that case, you need _.unionWith or _.unionBy and pass the custom equality check.
        const allActiveNames = _.union(activeNames, appState.customSelect.selectedNames);

        return {
            ...appState,
            customSelect: {
                ...appState.customSelect,
                selectedNames: allActiveNames,
            }
        };
    }),
);

export function appReducer(state, action) {
	return _appReducer(state, action);
}
