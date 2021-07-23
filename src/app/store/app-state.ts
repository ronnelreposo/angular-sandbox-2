import { User } from "../app.component";
import * as immutable from 'immutable';

/*
 conclusion: doesn't matter if immutable or no,
 only matters is the contents of the array should not change
 reference if not changed.
 But, immutablejs prevents mutation.
*/

export type AppState = {
    users: User[]
}


export const initialState: Readonly<AppState> = {

    users: [] 
}