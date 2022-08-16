import { Component, OnInit, resolveForwardRef } from '@angular/core';
import { Vector } from './core/vector';
import * as vec from './core/vector';
import { map, mapTo, scan, startWith, switchMap, switchMapTo, take, takeUntil, tap, throttleTime } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, EMPTY, fromEvent, interval, Observable } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';

type WebVector = Vector & { kind: 'web-vector' }

type LocationAndVelocityAndAcceleration = {
  location: Vector,
  velocity: Vector,
  acceleration: Vector,
}

/**
 * Transforms a vector to a vector origin starting from lower left of the browser.
 * */
const transformToWebVec = (dimensions: { widthPx: number, heightPx: number }) => (vector: Vector): WebVector => {

  return {
    kind: 'web-vector',
    x: vector.x,
    y: dimensions.heightPx - vector.y
  }
};

/**
 * Transforms a webvector to a vector origin starting from lower left of the browser.
 * */
const transformFromWebVec = (dimensions: { widthPx: number, heightPx: number }) => (webVec: WebVector): Vector => {

  return {
    x: webVec.x,
    y: dimensions.heightPx - webVec.y
  }
};

const alignCenter = (ballDiameterPx: number) => (webVector: WebVector): WebVector => {
  return {
    kind: 'web-vector',
    x: webVector.x,
    y: webVector.y - ballDiameterPx  
  }
};

const limit = (maxMagnitude: number) => (velocity: Vector, acceleration: Vector) => {

  return (vec.magnitude(velocity) > maxMagnitude) ? velocity
    : vec.add(velocity)(acceleration);
};

const addForce = (mass: number) => (force: Vector, vector: Vector): Vector => {

  return vec.add(vec.divide(mass)(force))(vector);
};

const addAllForces = (mass: number) =>
  (forces: Vector[], vector: Vector): Vector => {

  const [currentForce, ...restForces] = forces;

  if (!currentForce) {

    return vector;
  } else {

    const acc_ = addForce(mass)(currentForce, vector);
    return addAllForces(mass)(restForces, acc_);
  }
};

const mapLocationOnWall = (currentLocation: Vector, dimensionsInVector: Vector): Vector => {

  const onGround = currentLocation.y < 0
  if (onGround) {

    return  { ...currentLocation, y: 0 }
  }
  
  const onRightWall = currentLocation.x > dimensionsInVector.x;
  if (onRightWall) {

    return { ...currentLocation, x: dimensionsInVector.x }
  }

  const onLeftWall = (currentLocation).x < 0;
  if (onLeftWall) {

    return { ...currentLocation, x: 0 }
  }
  
  const onCeiling = currentLocation.y > dimensionsInVector.y
  if (onCeiling) {

    return { ...currentLocation, y: dimensionsInVector.y }
  }

  return currentLocation;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-sandbox';

  public webVec: WebVector
  public webVecs$: Observable<WebVector[]> = EMPTY;

  ngOnInit() {

    const ballDiameterPx = 25;

    const alignCenterBall = alignCenter(ballDiameterPx);

    const dimensions = { widthPx: 1400, heightPx: 1000  };

    const transformWebVec_ = transformToWebVec(dimensions);
    const transformFromWebVec_ = transformFromWebVec(dimensions);

    const dimensionsInWebVec: WebVector = {
      kind: "web-vector",
      x: dimensions.widthPx,
      y: dimensions.heightPx
    };
    const dimensionsInVector: Vector = {
      x: dimensionsInWebVec.x,
      y: dimensionsInWebVec.y
    };

    const location: Vector = { x: 1, y: 1 };
    const velocity: Vector = { x: 0, y: 0 };
    const topSpeed = 1.5;
    const mass = 1;

    const initLocationAndVelocity: LocationAndVelocityAndAcceleration = {
      velocity: velocity,
      location: location,
      acceleration: velocity 
    };
    const targetVector: Vector = {
      x: dimensionsInVector.x,
      y: dimensionsInVector.y
    };

    const count = 10;
    const xs = Array<LocationAndVelocityAndAcceleration>(count).fill({
      velocity: velocity,
      location: location,//vec.normalize({ x: Math.random(), y: Math.random() }),
      acceleration: velocity 
    })
    .map(x => {
      // const randromLocations = vec.add({ x: 2, y: 2 })
      const randromLocations = vec.scale(500 * Math.random())
      // const randromLocations = vec.scale(1)
        (vec.normalize({ x: Math.random(), y: Math.random() }))
      return {
        ...x,
        location: randromLocations,
      };
    });

    console.log(xs);

    const frame$ = interval(0, animationFrame);
    const mouseUp$ = fromEvent(document, "mouseup");
    const mouseDown$ = fromEvent(document, "mousedown");

    const trigger$ = mouseDown$
        .pipe(
          switchMapTo(
            frame$.pipe(
              // takeUntil(mouseUp$) <-- for manual trigger.
              )));

    const update = <T>(a: LocationAndVelocityAndAcceleration, _: T): LocationAndVelocityAndAcceleration => {

      const {
        velocity: currentVelocity,
        location: currentLocation,
        acceleration: currentAcceleration
      } = a;

      const direction = vec.subtract(targetVector)(initLocationAndVelocity.location);
      const normalizedDirection = vec.normalize(direction);
      const scaledNormDirection = vec.multiply(0.9)(normalizedDirection);

      // Simple wind.
      // const wind: Vector = { x: -0.01, y: 0.010 };

      const w1: Vector = vec.normalize({ x: 3, y: 1 });
      const w2: Vector = vec.normalize({ x: 4.5, y: 2 });
      const w3: Vector = vec.normalize({ x: 5, y: 5.5 });
      const upwardWind = vec.scale(0.07)(vec.normalize(vec.add(vec.add(w1)(w2))(w3)));
      const wind = upwardWind;
      const gravity: Vector = { x: 0, y: -0.001 };

      const onGround = currentLocation.y < 0
      if (onGround) {

        // Stage 2.
        const reversedAcceleration = vec.multiply(-1)(currentAcceleration);

        // Simulate. Rotate on impact.
        const rotatedAcceleration: Vector = { ...reversedAcceleration, x: -reversedAcceleration.x };

        const damped = vec.multiply(0.5)(rotatedAcceleration);
        // const velocityWithAcceleration = vec.divide(0.01)(rotatedAcceleration);
        const velocityWithAcceleration = rotatedAcceleration;

        const newLocation = vec.add(currentLocation)(velocityWithAcceleration);
        const onGroundLocation: Vector = mapLocationOnWall(newLocation, dimensionsInVector);
        return {
          location: onGroundLocation,
          velocity: velocityWithAcceleration,
          acceleration: velocityWithAcceleration,
        };
      }

      const onRightWall = (currentLocation).x > dimensionsInVector.x;
      if (onRightWall) {

        const reversedAcceleration = vec.multiply(-1)(currentAcceleration);
        // Simulate. Rotate on impact.
        const rotatedAcceleration: Vector = { ...reversedAcceleration, y: -reversedAcceleration.y };

        const damped = vec.multiply(0.5)(rotatedAcceleration);
        // const velocityWithAcceleration = vec.subtract(rotatedAcceleration)(damped);
        const velocityWithAcceleration = rotatedAcceleration;

        const newLocation = vec.add(currentLocation)(velocityWithAcceleration);
        const walledLocation: Vector = mapLocationOnWall(newLocation, dimensionsInVector);

        return {
          location: walledLocation,
          velocity: velocityWithAcceleration,
          acceleration: velocityWithAcceleration,
        };
      }

      const onLeftWall = (currentLocation).x < 0;
      if (onLeftWall) {

        const reversedAcceleration = vec.multiply(-1)(currentAcceleration);
        // Simulate. Rotate on impact.
        const rotatedAcceleration: Vector = { ...reversedAcceleration, y: -reversedAcceleration.y };

        const velocityWithAcceleration = rotatedAcceleration;

        const newLocation = vec.add(currentLocation)(velocityWithAcceleration);
        const walledLocation: Vector = mapLocationOnWall(newLocation, dimensionsInVector);

        return {
          location: walledLocation,
          velocity: velocityWithAcceleration,
          acceleration: velocityWithAcceleration,
        };
      }

      const onCeiling = currentLocation.y > dimensionsInVector.y
      if (onCeiling) {

        const reversedAcceleration = vec.multiply(-1)(currentAcceleration);
        // Simulate. Rotate on impact.
        const rotatedAcceleration: Vector = { ...reversedAcceleration, x: -reversedAcceleration.x };

        const velocityWithAcceleration = rotatedAcceleration;

        const newLocation = vec.add(currentLocation)(velocityWithAcceleration);
        const onCeilingLocation: Vector = mapLocationOnWall(newLocation, dimensionsInVector);

        return {
          location: onCeilingLocation,
          velocity: velocityWithAcceleration,
          acceleration: velocityWithAcceleration,
        };
      }

      const velocityWithAddedForces = addAllForces(mass)([wind, gravity], currentVelocity);
      // const damped = vec.multiply(0.6)(velocityWithAddedForces);
      const velocityWithAcceleration = limit(topSpeed)(velocityWithAddedForces, scaledNormDirection);
      const newLocation = vec.add(currentLocation)(velocityWithAcceleration);
      return {
        location: newLocation,
        velocity: velocityWithAcceleration,
        acceleration: velocityWithAddedForces
      };
    };

    const updateAll = <T>(a: LocationAndVelocityAndAcceleration[], _: T): LocationAndVelocityAndAcceleration[] => {
      return a.map(update);
    };

    const animate$ = trigger$
      .pipe(
        // take(1), // <-- allow frame limit.
        scan(updateAll, xs),
        map(xs => xs.map(({location}) => transformWebVec_(location))),
        // tap(xs => console.log("compute v", xs)),
      );

    this.webVecs$ = animate$;
  }

}
