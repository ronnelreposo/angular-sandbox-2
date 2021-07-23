import { User } from "../app.component";
import * as immutable from 'immutable';


export type AppState = {

    users: immutable.List<User>
}


export const initialState: Readonly<AppState> = {

    users: immutable.List()
}