import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMapTo } from "rxjs/operators";
import * as actions from './actions';
import * as immutable from 'immutable';
import { User } from "../app.component";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class AppEffects {


    constructor(
        private actions$: Actions,
        private httpClient: HttpClient
    ) { }
    
    loadUsersEffect$ = createEffect(() => {
        // query API.
        const remoteUsers$: Observable<User[]> = this.httpClient
            .get<User[]>('https://jsonplaceholder.typicode.com/users');

        return this.actions$.pipe(
            ofType(actions.loadItems),
            switchMapTo(remoteUsers$),
            map(users =>
                actions.loadItemsSucceed({ users: immutable.List(users) }))
        );
    });
}