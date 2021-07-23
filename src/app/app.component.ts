import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { merge, Observable, Subject } from 'rxjs';
import * as immutable from 'immutable';
import { FormBuilder } from '@angular/forms';
import { map, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export type User = { id: number; name: string; phone: string };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {

  users$: Observable<immutable.List<User>>;

  load$: Subject<void>;
  count = 0;

  private store$: Subject<immutable.List<User>>;
  // push changes.
  public userLocalChanges$: Subject<User>;

  private destroy$: Subject<void>;

  constructor(private httpClient: HttpClient) {}

  ngOnDestroy(): void {

    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
  
    this.load$ = new Subject();
    this.store$ = new Subject();
    this.userLocalChanges$ = new Subject<User>();
    this.destroy$ = new Subject();

    // query API.
    const remoteUsers$ = this.load$.pipe(
      switchMap(() => {
        // API Query.
        const users$: Observable<User[]> = this.httpClient.get<
          User[]
        >('https://jsonplaceholder.typicode.com/users');
        return users$;
      }),
      map(xs => immutable.List(xs))
      // tap(x => console.log('api'))
    );

    // Update Local User.
    const updatedStore$ = this.userLocalChanges$.pipe(
      withLatestFrom(this.store$),
      map(([userLocalChange, storedUsers]) => {
        // update user.
        return storedUsers.update(
          storedUsers.findIndex(
            storedUser => storedUser.id === userLocalChange.id
          ),
          storedUser => userLocalChange
        );
      }),
      // tap(xs => console.log('user changes'))
    );

    // Merge Remote and Local Updates
    this.users$ = merge(remoteUsers$, updatedStore$).pipe(shareReplay());

    // push changes to the store.
    this.users$
    .pipe(takeUntil(this.destroy$))
    .subscribe(xs => this.store$.next(xs));
  }

  traceRendering(view: string) {
    console.log('render' + view);
  }

  increment() {
    this.count++;
  }

  trackFunc(index, user: User) {
    return user.id;
  }
}
