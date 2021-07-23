import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { User } from '../app.component';
import { valueChange } from '../store/actions';
import { AppState } from '../store/app-state';

@Component({
  selector: 'app-my-form',
  templateUrl: './my-form.component.html',
  styleUrls: ['./my-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyFormComponent implements OnInit, OnDestroy {
  @Input() user: User;
  userForm: FormGroup;

  private destroy$: Subject<void>;

  constructor
    ( private fb: FormBuilder
    , private store: Store<{ appState: AppState }>
  ) {

    // console.log("[form component] constructor user id of: ", this.user.id);
  }

  ngOnInit() {
    
    console.log("[form component] OnInit user id of: ", this.user.id);

    this.destroy$ = new Subject();

    const constructUserFormGroup = (user: User): FormGroup => {
      return this.fb.group({
        id: [user.id],
        name: [user.name],
        phone: [user.phone]
      });
    };

    this.userForm = constructUserFormGroup(this.user);

    // Push changes to the store.
    this.userForm.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(user =>
      this.store.dispatch(valueChange({ changedUser: user })));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  traceRendering(view: string) {
    console.log('render on component user: id of ' + view);
  }
}
