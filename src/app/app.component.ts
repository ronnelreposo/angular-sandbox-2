import { Component, OnInit } from '@angular/core';
import { from, interval, of, Subject } from 'rxjs';
import * as vector from './core/vector';
import { Vector } from './core/vector';
import { scan, switchMap, switchMapTo, take } from 'rxjs/operators';
import { takeWhile, tap } from 'lodash';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';
import { mapToMapExpression } from '@angular/compiler/src/render3/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-sandbox';

  public move$: Subject<void>;

  constructor() { }

  ngOnInit(): void {

    this.move$ = new Subject();

    const ball = document.getElementById('ball');
    const ballRadiusInPx = 25;
    const widthInPx = 800;
    const heightInPx = 400;

    const initialVector = { x: 50, y: 50 };;
    const velocity: Vector = { x: 1, y: 1 };

    const alignCenterBall = (x: number) => x - ballRadiusInPx;
  
    const vector$ = interval(1, animationFrame)
      .pipe(
        // take(500),
        // vector in motion
        scan((vectorAcc, _) => {

            return vector.add(vectorAcc)(velocity);
        }, initialVector)
      )

    const onMove$ = this.move$.pipe(
        switchMapTo(vector$)
    );
    
    onMove$.subscribe(({ x, y }) => {

      ball.style.left = alignCenterBall(x) + 'px';
      ball.style.top = alignCenterBall(y) + 'px';
    });
  }
}
