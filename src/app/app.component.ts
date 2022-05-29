import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Vector } from './core/vector';
import * as vec from './core/vector';
import { map, scan, take, tap } from 'rxjs/operators';
import { combineLatest, fromEvent, interval } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';

type WebVector = Vector & { kind: 'web-vector' }

type LocationAndVelocity = {
  id: string,
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
export class AppComponent implements OnInit, AfterViewInit {
  
  title = 'angular-sandbox';

  ballDiameterPx = 25;

  alignCenterBall = alignCenter(this.ballDiameterPx);

  dimensions = { widthPx: 1400, heightPx: 1000  };
  transformWebVec_ = transformToWebVec(this.dimensions);
  transformFromWebVec_ = transformFromWebVec(this.dimensions);

  location: Vector = { x: 200, y: 0 };
  velocity: Vector = { x: 0, y: 0 };
  topSpeed = 10;

  add_ = (v: Vector) => vec.add(v)(this.location)

  public xs: LocationAndVelocity[] = [
      { id: "mercury", velocity: this.velocity, location: this.add_({ x: 100, y: 100}) },
      { id: "venus", velocity: this.velocity, location: this.add_({ x: 200, y: 100}) },
      { id: "mars", velocity: this.velocity, location: this.add_({ x: 100, y: 200}) },
    ];

  ngOnInit() { }

  ngAfterViewInit(): void {

    const mouseMove$ = fromEvent(document, "mousemove")
      .pipe(
        map<MouseEvent, WebVector>((ev: MouseEvent) =>
          ({ kind: "web-vector", x: ev.pageX, y: ev.pageY })),
        map(this.transformFromWebVec_),
        // tap(ev => console.log("mouse move vec: ", ev))
        );

    const frame$ = interval(1, animationFrame);

    const f = (a: LocationAndVelocity, [_, mouseVector]: [number, Vector]): LocationAndVelocity => {

          const { velocity: currentVelocity, location: currentLocation } = a;

          const direction = vec.subtract(mouseVector)(currentLocation);
          const normalizedDirection = vec.normalize(direction);
          const scaledNormDirection = vec.multiply(0.01)(normalizedDirection);

          const velocityWithAcceleration = limit(this.topSpeed)(currentVelocity, scaledNormDirection);
          const newLocation = vec.add(currentLocation)(velocityWithAcceleration);

          return {
            id: a.id,
            location: newLocation,
            velocity: velocityWithAcceleration
          };

    };

    // accelerates towards mouse with top speed 10.
    const animate$ = combineLatest([frame$, mouseMove$])
      .pipe(
        // take(500), // <-- allow frame limit.
        scan((a, x) => {

          return a.map(a_ => f(a_, x));
          // return f(a, x);
        }, this.xs),
        map(xs => xs.map(({id, location}) => ({ id, location: this.transformWebVec_(location) })))
      );

    animate$.subscribe(ys => {

      // console.log(webVectors)

      const alignedWebVectors = ys.map(({id, location: webVector}) =>
        ({ id, alignedWebVector: this.alignCenterBall(webVector) }));

      alignedWebVectors.forEach(({ id, alignedWebVector }) => {


        const elem = document.getElementById(id);
          // console.log(elem);
        if (elem) {
          // console.log(elem);

          elem.style.left = alignedWebVector.x + "px";
          elem.style.top = alignedWebVector.y + "px";
        }
      });
    });

  }
}
