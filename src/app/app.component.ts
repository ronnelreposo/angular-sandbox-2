import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { from, fromEvent, interval, Observable, of, Subject } from 'rxjs';
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
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'angular-sandbox';

  public move$: Subject<void>;
  public particles$: Observable<Vector[]>;

  constructor() { }

  ngOnInit(): void {

    this.move$ = new Subject();

    const mouseMove$ = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        map(mouseEv => ({ x: mouseEv.clientX, y: mouseEv.clientY })),
      );

    const ballRadiusInPx = 25;
    const widthInPx = 1400;
    const heightInPx = 1000;
    const topSpeed = 10;

    const random = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min)) + min;

    const particleVectors = [
      { x: random(0, widthInPx), y: random(0, heightInPx) },
      { x: random(0, widthInPx), y: random(0, heightInPx) },
      { x: random(0, widthInPx), y: random(0, heightInPx) }
    ];

    const initialVelocity: Vector = { x: 0, y: 0 };
    
    const initialLocationsAndVelocities: LocationAndVelocity[] = particleVectors
    .map(particleVector => ({ location: particleVector, velocity: initialVelocity }));

    const move = (targetVector: Vector, location: Vector, velocity: Vector): LocationAndVelocity => {

      const mappedLocation = mapOnEdge(widthInPx, heightInPx, ballRadiusInPx)
        (location);

      const direction = vector.subtract(targetVector)(mappedLocation);
      const directionNormalized = vector.normalize(direction);
      const acceleration = vector.multiply(0.1)(directionNormalized);

      // Magnitude of velocity could accelerate at a constant speed, we limit it.
      const velocityWithAcceleration = limit(topSpeed)(velocity, acceleration);
      const locationVectorPrime = vector.add(mappedLocation)(velocityWithAcceleration);

      const locationAndVelocity: LocationAndVelocity = {
        location: locationVectorPrime,
        velocity: velocityWithAcceleration
      };

      return locationAndVelocity;
    };
  
    const vector$ = (mouseVector: Vector) => interval(1, animationFrame)
      .pipe(
        scan((locationsAndVelocities, _) => {

          return locationsAndVelocities
            .map(({ location, velocity }) =>
              move(mouseVector, location, velocity));

        }, initialLocationsAndVelocities),
        startWith(initialLocationsAndVelocities)
      )

    const onMove$ = mouseMove$.pipe(
        switchMap(vector$)
    );

    this.particles$ = onMove$.pipe(map(locationsAndVelocities => {

      return locationsAndVelocities
        .map(({ location: {x, y}, velocity}) => {

          // render center ball.
          return {
            x: alignCenterBall(x, ballRadiusInPx),
            y: alignCenterBall(y, ballRadiusInPx)
          };
        });

    }));
  }

  trackByFunc(index, _) {

    return index;
  }
}
