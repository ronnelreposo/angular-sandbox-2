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
    const toWebVec_ = transformToWebVec(dimensions);

    const location: Vector = { x: 0, y: 0 };
    const velocity: Vector= { x: 1, y: 1 };

    // simple motion.
    const vector$ = interval(1, animationFrame)
      .pipe(
        take(300), // <-- limit frame tick for now.
        // vector in motion
        scan((currentLocation, _) => {

            return vec.add(currentLocation)(velocity);
        }, location),
        map(toWebVec_)
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
