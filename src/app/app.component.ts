import { Component, OnInit } from '@angular/core';
import { fromEvent, interval, Observable, Subject } from 'rxjs';
import * as vector from './core/vector';
import { Vector } from './core/vector';
import { map, scan, startWith, switchMap, tap } from 'rxjs/operators';
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

const applyForce = (mass: number) => (acceleration: Vector) => (force: Vector) => {

  const forceWithMass = vector.divide(mass)(force);
  return vector.add(acceleration)(forceWithMass);
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
    const topSpeed = 10;

    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

    const initialLocation: Vector = {
      x: 200,
      y: 200
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

            // reset velocity if on edge of world.
            const velocityPrime = mappedLocation.x == 0 || mappedLocation.y == 0 ? initialVelocity : velocity;

            const direction = vector.subtract(targetVector)(mappedLocation);
            const directionNormalized = vector.normalize(direction);
            const acceleration = vector.multiply(0.01)(directionNormalized);

            const mass = 10;
            const applyForceWithMass = applyForce(mass);

            //#region Apply forces to acceleration.

            // Appy Wind
            const wind: Vector = { x: 0.01, y: 0 };
            const appliedWindForceToAcceleration = applyForceWithMass(acceleration)(wind);
            
            // Apply Gravity
            const gravity: Vector = { x: 0.0, y: 0.1 };
            const appliedGravityToAcceleration = applyForceWithMass(appliedWindForceToAcceleration)(gravity)

            // Apply Friction
            const normal = 1;
            const frictionCoefficient = 0.03;
            const frictionMagnitude = frictionCoefficient * normal;
            const friction = vector.multiply(frictionMagnitude)
              (vector.normalize(vector.multiply(-1)(velocityPrime)));
            const appliedFrictionToAcceleration = applyForceWithMass(appliedGravityToAcceleration)(friction);
            
            //#endregion

            // Magnitude of velocity could accelrate at a constant speed, we limit it.
            const velocityWithAcceleration = limit(topSpeed)(velocityPrime, appliedFrictionToAcceleration);
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
