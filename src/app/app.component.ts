import { Component, OnInit } from '@angular/core';
import { Vector } from './core/vector';
import * as vec from './core/vector';
import { map, scan, take } from 'rxjs/operators';
import { interval } from 'rxjs';
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

const alignCenter = (ballDiameterPx: number) => (webVector: WebVector): WebVector => {
  return {
    kind: 'web-vector',
    x: webVector.x,
    y: webVector.y - ballDiameterPx  
  }
};

const limit = (maxMagnitude: number) => (velocity: Vector, acceleration: Vector) => {

  return (vec.magnitude(velocity) > maxMagnitude) ? velocity : vec.add(velocity)(acceleration);
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

    const location: Vector = { x: 0, y: 0 };
    const velocity: Vector = { x: 1, y: 0 };
    const acceleration: Vector = { x: 0.001, y: 0.01 };
    const topSpeed = 10;

    const initLocationAndVelocity: LocationAndVelocity = {
      velocity: velocity,
      location: location 
    };

    // simple motion with acceleration of top speed 10.
    const vector$ = interval(1, animationFrame)
      .pipe(
        take(300), // <-- limit frame tick for now.
        // vector in motion
        scan((a, _) => {

          const { velocity: currentVelocity, location: currentLocation } = a;

          const velocityWithAcceleration = limit(topSpeed)(currentVelocity, acceleration);
          const newLocation = vec.add(currentLocation)(velocityWithAcceleration);

          return {
            location: newLocation,
            velocity: velocityWithAcceleration
          };
        }, initLocationAndVelocity),
        map(({ location }) => transformWebVec_(location))
      );

    vector$
    .subscribe(webVector => {

      console.log(webVector)

      const alignedWebVector = alignCenterBall(webVector);
      const elem = document.getElementById("webVec")
      elem.style.left = alignedWebVector.x + "px";
      elem.style.top = alignedWebVector.y + "px";
    });
  }
}
