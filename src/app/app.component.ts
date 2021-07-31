import { Component, OnInit } from '@angular/core';
import { Vector } from './core/vector';

type WebVector = Vector & { kind: 'web-vector' }

/**
 * Transforms a vector to a vector origin starting from lower left of the browser.
 * */
const toWebVec = (dimensions: { widthPx: number, heightPx: number }) => (vector: Vector): WebVector => {

  return {
    kind: 'web-vector',
    x: vector.x,
    y: dimensions.heightPx 
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

    const myVector = { x: 0, y: 0 };

    const webVector = toWebVec(dimensions)(myVector);
    const alignedWebVector = alignCenterBall(webVector);

    const elem = document.getElementById("webVec")
    elem.style.left = alignedWebVector.x + "px";
    elem.style.top = alignedWebVector.y + "px";
  }
}
