import { Injectable } from "@angular/core";
import { Actions, createEffect } from '@ngrx/effects';
import { interval } from "rxjs";
import { map, switchMapTo } from "rxjs/operators";
import * as actions from './actions';

@Injectable()
export class AppEffects {


    constructor(private actions$: Actions) { }

    loadLookupDataEffect$ = createEffect(() => {

        return this.actions$.pipe(
            switchMapTo(interval(1000)),
            map(_ => actions.incrementCounterAction({ kind: 'increment' })),
        );

    });
}