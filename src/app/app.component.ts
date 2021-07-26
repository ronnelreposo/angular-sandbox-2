import { Component, OnInit } from '@angular/core';
import { combineLatest, EMPTY, from, fromEvent, interval, merge, Observable, of, Subject } from 'rxjs';
import * as vector from './core/vector';
import { Vector } from './core/vector';
import { map, mapTo, scan, startWith, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';

type LocationAndVelocity = { location: Vector, velocity: Vector }

const alignCenterBall = (x: number, radius: number) => x - radius;

const mapOnEdge = (width: number, height: number, radius: number) =>
  ({ x, y }: Vector): Vector => {

  const xPrime = (x > width) ? 0 : (x < 0) ? width : x;
  const yPrime = (y > height) ? 0 : (y < 0) ? height : y;

  return {
    x: xPrime,
    y: yPrime
  }
};

const limit = (maxMagnitude: number) => (velocity: Vector, accelaration: Vector) => {

  if (vector.magnitude(velocity) > maxMagnitude) {

    return velocity;
  } else {

    return vector.add(velocity)(accelaration);
  }

};

const applyForce = (acceleration: Vector) => (force: Vector) => {

  return vector.add(acceleration)(force)
}

const fromMouseEvent = (eventType: string): Observable<Vector> => {

  return fromEvent<MouseEvent>(document, eventType)
      .pipe(
        map<MouseEvent, Vector>(mouseEv =>
          ({ x: mouseEv.clientX, y: mouseEv.clientY })),
      );
};


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

    const frames$ = interval(1, animationFrame);

    const mouseDown$ = fromMouseEvent('mousedown');

    const ball = document.getElementById('ball');
    const ballRadiusInPx = 25;
    const widthInPx = 1400;
    const heightInPx = 1000;
    const topSpeed = 1;

    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

    const initialLocation: Vector = {
      x: widthInPx / 2,
      y: heightInPx / 2
    };

    const initialVelocity: Vector = { x: 0, y: 0 };
    const initialLocationAndVelocity: LocationAndVelocity = {
      location: initialLocation,
      velocity: initialVelocity
    };
  
    const vector$ = (targetVector: Vector) => frames$
      .pipe(
        scan(({ location, velocity }, _) => {

            const mappedLocation = mapOnEdge(widthInPx, heightInPx, ballRadiusInPx)
              (location);

            const direction = vector.subtract(targetVector)(mappedLocation);
            const directionNormalized = vector.normalize(direction);
            const acceleration = vector.multiply(0.1)(directionNormalized);

            const wind: Vector = { x: 0.5, y: 0 };
            // apply forces to acceleration.
            const appliedWindAcceleration = applyForce(acceleration)(wind);

            // Magnitude of velocity could accelrate at a constant speed, we limit it.
            const velocityWithAcceleration = limit(topSpeed)(velocity, appliedWindAcceleration);
            const locationVectorPrime = vector.add(mappedLocation)(velocityWithAcceleration);

            const locationAndVelocity: LocationAndVelocity = {
              location: locationVectorPrime,
              velocity: velocityWithAcceleration
            };

            return locationAndVelocity;
        }, initialLocationAndVelocity),
        startWith(initialLocationAndVelocity)
      )

    const target$ = mouseDown$;

    const combined$ = target$.pipe(
        switchMap((target) => vector$(target))
    );
    
    combined$.subscribe(({ location: {x, y}, velocity}) => {

      ball.style.left = alignCenterBall(x, ballRadiusInPx) + 'px';
      ball.style.top = alignCenterBall(y, ballRadiusInPx) + 'px';
    });
  }
}
