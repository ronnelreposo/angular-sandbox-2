import { Component, OnInit } from '@angular/core';
import { Vector } from './core/vector';
import * as vec from './core/vector';
import { map, mapTo, scan, switchMap, switchMapTo, take, takeUntil, tap, throttleTime } from 'rxjs/operators';
import { combineLatest, EMPTY, fromEvent, interval } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';

type WebVector = Vector & { kind: 'web-vector' }

type LocationAndVelocity = {
  location: Vector,
  velocity: Vector
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-sandbox';

  ngOnInit() {
      
    const ballDiameterPx = 25;

    const alignCenterBall = alignCenter(ballDiameterPx);

    const dimensions = { widthPx: 1400, heightPx: 1000  };
    const transformWebVec_ = transformToWebVec(dimensions);
    const transformFromWebVec_ = transformFromWebVec(dimensions);

    const location: Vector = { x: 0, y: 0 };
    const velocity: Vector = { x: 0, y: 0 };
    const topSpeed = 1;
    const mass = 10;

    const initLocationAndVelocity: LocationAndVelocity = {
      velocity: velocity,
      location: location 
    };

    const frame$ = interval(1, animationFrame);
    const mouseUp$ = fromEvent(document, "mouseup");
    const mouseDown$ = fromEvent(document, "mousedown");

    const trigger$ = mouseDown$
        .pipe(
          switchMapTo(
            frame$.pipe(takeUntil(mouseUp$))));

    // accelerates towards mouse with top speed 10.
    const animate$ = trigger$
      .pipe(
        // take(500), // <-- allow frame limit.
        scan((a, _) => {

          const { velocity: currentVelocity, location: currentLocation } = a;

          const targetVector = { x: 0, y: 1 };
          const direction = vec.subtract(targetVector)(initLocationAndVelocity.location);
          const normalizedDirection = vec.normalize(direction);
          const scaledNormDirection = vec.multiply(0.5)(normalizedDirection);

          const addForceWithMass = addForce(mass);

          const wind: Vector = { x: 0.02, y: 0 };
          const gravity: Vector = { x: 0, y: -0.05 };

          const velocityWithWind = addForceWithMass(wind, currentVelocity);
          const velocityWithGravity = addForceWithMass(gravity, velocityWithWind);

          const velocityWithAcceleration = limit(topSpeed)(velocityWithGravity, scaledNormDirection);
          const newLocation = vec.add(currentLocation)(velocityWithAcceleration);

          return {
            location: newLocation,
            velocity: velocityWithAcceleration
          };
        }, initLocationAndVelocity),
        map(({ location }) => transformWebVec_(location))
      );

    animate$.subscribe(webVector => {

      console.log(webVector)

      const alignedWebVector = alignCenterBall(webVector);
      const elem = document.getElementById("webVec")
      elem.style.left = alignedWebVector.x + "px";
      elem.style.top = alignedWebVector.y + "px";
    });
  }
}
