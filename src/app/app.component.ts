import {Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {debounceTime, fromEvent, map, Subject, take, takeUntil, throttleTime} from "rxjs";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Portfolio';
  platformID = inject(PLATFORM_ID)
  destroy = new Subject<void>();
  screenTransformCounter = 0

  constructor(private el: ElementRef) {
    console.log("platformID " + this.platformID)
  }

  ngOnInit() {
    if (typeof window !== "undefined") {
      console.log("scroll position oninit "+this.getScrollPosition());
      this.updateTransform(this.getScrollPosition())
      const scrollEvent = fromEvent(window, "scroll").pipe(
        // throttleTime(1000),
        // debounceTime(100),
        map(() => window.scrollY || document.documentElement.scrollTop ||
          document.body.scrollTop || 0),
        takeUntil(this.destroy),
        // take(6)
      )

      scrollEvent.subscribe(scrollPosition => {
        this.updateTransform(scrollPosition)
      })

    }
  }

  ngOnDestroy() {
    this.destroy.next()
    this.destroy.complete()
  }

  private getScrollPosition(): number {
    return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  updateTransform(scrollPosition: number) {
    if (scrollPosition > 400){
      return
    }
    // this.screenTransformCounter++

    const maxScroll = 500
    const scaleValue = 1.05
    // const rotateValue = 14 - (scrollPosition / maxScroll) * 14
    const rotateValue = 14 - ((scrollPosition/100) * 3.5)
    // console.log("SCROLL ")
    console.log(" SCROLLING " + scrollPosition)
    const transformValue = "scale(" + scaleValue + ") rotateX(" + rotateValue + "deg) " +
      "translateZ(0px)";
    const screenElement = this.el.nativeElement.querySelector('.screen');
    screenElement.style.transform = transformValue;
  }
}
