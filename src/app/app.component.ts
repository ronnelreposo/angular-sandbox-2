import { Component, OnInit } from '@angular/core';
import { from, interval, of, Subject } from 'rxjs';
import * as vector from './core/vector';
import { Vector } from './core/vector';
import { scan, startWith, switchMapTo, take } from 'rxjs/operators';
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

    const ball = document.getElementById('ball');
    const ballRadiusInPx = 25;
    const widthInPx = 800;
    const heightInPx = 400;
    const topSpeed = 2;

    const initialLocation: Vector = {
      x: widthInPx / 2,
      y: heightInPx / 2
    };

    const initialVelocity: Vector = { x: 0, y: 0 };
    const acceleration: Vector = { x: -0.001, y: 0.01 };
    const initialLocationAndVelocity: LocationAndVelocity = {
      location: initialLocation,
      velocity: initialVelocity
    };
  
    const vector$ = interval(1, animationFrame)
      .pipe(
        // take(1000),
        // vector in motion
        scan(({ location, velocity }, _) => {

            const mappedLocation = mapOnEdge(widthInPx, heightInPx, ballRadiusInPx)
              (location);

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

    const onMove$ = this.move$.pipe(
        switchMapTo(vector$)
    );
    
    onMove$.subscribe(({ location: {x, y}, velocity}) => {

      ball.style.left = alignCenterBall(x, ballRadiusInPx) + 'px';
      ball.style.top = alignCenterBall(y, ballRadiusInPx) + 'px';
    });
  }
}
