import { Component, OnInit } from '@angular/core';
import { Vector } from './core/vector';
import * as vec from './core/vector';
import { map, scan, take } from 'rxjs/operators';
import { interval } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';

type WebVector = Vector & { kind: 'web-vector' }

/**
 * Transforms a vector to a vector origin starting from lower left of the browser.
 * */
const toWebVec = (dimensions: { widthPx: number, heightPx: number }) => (vector: Vector): WebVector => {

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

type VelocityAndLocation = { velocity: Vector, location: Vector };

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
    const toWebVec_ = toWebVec(dimensions);

    const location: Vector = { x: 0, y: 0 };
    const velocity: Vector = { x: 1, y: 1 };


    const initVelocityAndLocation: VelocityAndLocation = {
      location, velocity
    };

    const gravity: Vector = { x: 0, y: -0.001 };

    const update = (a: VelocityAndLocation, _: unknown): VelocityAndLocation => {

      const forces = vec.add(a.velocity)(gravity);

      const dampingFactor = 0.999;
      const newVelocity = vec.scale(dampingFactor)(forces);

      // at bottom. stop!
      if (a.location.y < 0) {
        return {
          location: vec.add(a.location)(newVelocity),
          velocity: vec.scale(dampingFactor)({ x: a.velocity.x, y: 0 })
        };
      }

      return {
        location: vec.add(a.location)(newVelocity),
        velocity: newVelocity
      };
    };

    // simple motion.
    const vector$ = interval(1, animationFrame)
      .pipe(
        // take(300), // <-- limit frame tick for now.
        // vector in motion
        scan(update, initVelocityAndLocation),
        map(d => toWebVec_(d.location))
      );

    vector$
    .subscribe(webVector => {

      // console.log(webVector)

      const alignedWebVector = alignCenterBall(webVector);
      const elem = document.getElementById("webVec")
      elem.style.left = alignedWebVector.x + "px";
      elem.style.top = alignedWebVector.y + "px";
    });
  }
}
