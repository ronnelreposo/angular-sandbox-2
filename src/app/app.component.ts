import { Component, OnInit } from '@angular/core';
import { from, fromEvent, interval, of, Subject } from 'rxjs';
import * as vector from './core/vector';
import { Vector } from './core/vector';
import { map, scan, startWith, switchMap, take, tap } from 'rxjs/operators';
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

    const mouseMove$ = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        map(mouseEv => ({ x: mouseEv.clientX, y: mouseEv.clientY })),
      );

    const ball = document.getElementById('ball');
    const ballRadiusInPx = 25;
    const widthInPx = 800;
    const heightInPx = 400;
    const topSpeed = 10;

    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

    const initialLocation: Vector = {
      x: random(0, widthInPx),
      y: random(0, heightInPx)
    };

    const initialVelocity: Vector = { x: 0, y: 0 };
    const initialLocationAndVelocity: LocationAndVelocity = {
      location: initialLocation,
      velocity: initialVelocity
    };
  
    const vector$ = (mouseVector: Vector) => interval(1, animationFrame)
      .pipe(
        scan(({ location, velocity }, _) => {

            const mappedLocation = mapOnEdge(widthInPx, heightInPx, ballRadiusInPx)
              (location);

            const direction = vector.subtract(mouseVector)(mappedLocation);
            const directionNormalized = vector.normalize(direction);
            const acceleration = vector.multiply(0.01)(directionNormalized);

            // Magnitude of velocity could accelrate at a constant speed, we limit it.
            const velocityWithAcceleration = limit(topSpeed)(velocity, acceleration);
            const locationVectorPrime = vector.add(mappedLocation)(velocityWithAcceleration);

            const locationAndVelocity: LocationAndVelocity = {
              location: locationVectorPrime,
              velocity: velocityWithAcceleration
            };

            return locationAndVelocity;
        }, initialLocationAndVelocity),
        startWith(initialLocationAndVelocity)
      )

    const onMove$ = mouseMove$.pipe(
        switchMap(vector$)
    );
    
    onMove$.subscribe(({ location: {x, y}, velocity}) => {

      ball.style.left = alignCenterBall(x, ballRadiusInPx) + 'px';
      ball.style.top = alignCenterBall(y, ballRadiusInPx) + 'px';
    });
  }
}
