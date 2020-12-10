import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, Observable, of, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { animate, style, transition, trigger } from '@angular/animations';


/**
 * Conclusion so far:
 * 
 * Angular animation is great but in this experiment,
 * it fails to address the ticker problem, it re-animates when a ticker fires.
 */

type Card = {
  id: string
  name: string
  answer: number
}

type Swimlane = {
  id: string
  cards: Card[]
}

type Data = {
  swimlanes: Swimlane[]
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ backgroundColor: 'green', opacity: 0 }),
        animate(2000)
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  title = 'angular-sandbox';

  data$: Observable<Data>
  searchKeyWord$: BehaviorSubject<string>

  ngOnInit() {

    // expensive fibonacci
    function fibonacci(num) {
      if (num <= 1) return 1;
      return fibonacci(num - 1) + fibonacci(num - 2);
    }

    // util
    function randomIntFromInterval(min, max) { // min and max included
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * Populate Mock Cards based on swimlane id.
     * @param swimlaneId 
     */
    const populateMockCards = (swimlaneId: string) => (length: number): Card[] => {

      let acc: Card[] = [];
      for(let i=0; i<length; i++) {
        acc = [
          ...acc,
          { id: swimlaneId + '-' + i,
            name: 'c' + swimlaneId + '-' + i,
            answer: fibonacci(randomIntFromInterval(1, 30))
          }
        ]
      }
      return acc;
    };
      

    const source$ = of({
      swimlanes: [
      { id: '1', cards: populateMockCards('1')(1000) },
      { id: '2', cards: populateMockCards('2')(1000) },
      { id: '3', cards: populateMockCards('3')(1000) }
      ]
    });

    this.searchKeyWord$ = new BehaviorSubject("");
    const ticker$ = interval(1000);
  
    this.data$ = combineLatest([
      source$,
      this.searchKeyWord$,
      // ticker$
    ])
      .pipe(
        map(([data, keyword]) => {

          if (keyword === "") { // no keyword then return plain data.
            return {
              ...data,
              swimlanes: data.swimlanes.map(swimlane =>
                ({ ...swimlane,
                  cards: swimlane.cards.map(x => x) // map identity
                })) 
            }
          } else {
            return {
              ...data,
              swimlanes: data.swimlanes.map(swimlane =>
                ({ ...swimlane,
                  cards: swimlane.cards.filter(card => card.name.includes(keyword))
                })) 
            }
          }
        }),
        tap(x => console.log('fired'))
      )
  }

  search(ev) {
    console.log('searching ev: ', ev.target.value);
    this.searchKeyWord$.next(ev.target.value);
  }

  public fibonacci(num) {
    if (num <= 1) return 1;
    return this.fibonacci(num - 1) + this.fibonacci(num - 2);
  }


}
