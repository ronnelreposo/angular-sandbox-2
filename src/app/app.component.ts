import { Component, OnInit } from '@angular/core';
import { Vector } from './core/vector';
import * as vec from './core/vector';
import { map, scan, take, tap } from 'rxjs/operators';
import { combineLatest, fromEvent, interval } from 'rxjs';
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
    const topSpeed = 10;

    const initLocationAndVelocity: LocationAndVelocity = {
      velocity: velocity,
      location: location 
    };

    const mouseMove$ = fromEvent(document, "mousemove")
      .pipe(
        map<MouseEvent, WebVector>((ev: MouseEvent) =>
          ({ kind: "web-vector", x: ev.pageX, y: ev.pageY })),
        map(transformFromWebVec_),
        tap(ev => console.log("mouse move vec: ", ev))
        );

    const frame$ = interval(1, animationFrame);

    // accelerates towards mouse with top speed 10.
    const animate$ = combineLatest([frame$, mouseMove$])
      .pipe(
        // take(500), // <-- allow frame limit.
        scan((a, [_, mouseVector]) => {

          const { velocity: currentVelocity, location: currentLocation } = a;

          const direction = vec.subtract(mouseVector)(currentLocation);
          const normalizedDirection = vec.normalize(direction);
          const scaledNormDirection = vec.multiply(0.01)(normalizedDirection);

          const velocityWithAcceleration = limit(topSpeed)(currentVelocity, scaledNormDirection);
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
