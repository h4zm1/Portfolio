import {Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, NgZone, HostListener} from '@angular/core';
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
  ngOnInit() {
    // Restore scroll position
    if (typeof window !== "undefined") {
      const scrollPosition = localStorage.getItem('scrollPosition');
      if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition, 10));
      }
    }


    if (typeof window !== "undefined") {
      console.log("scroll position oninit " + this.getScrollPosition());
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
    // Save scroll position before leaving the page
    if (typeof window !== "undefined") {
      localStorage.setItem('scrollPosition', window.pageYOffset.toString());
    }
    this.destroy.next()
    this.destroy.complete()
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    // Save scroll position before page refresh
    localStorage.setItem('scrollPosition', window.pageYOffset.toString());
  }

  title = 'Portfolio';
  platformID = inject(PLATFORM_ID)
  destroy = new Subject<void>();
  screenTransformCounter = 0

  constructor(private el: ElementRef) {
    console.log("platformID " + this.platformID)
  }


  private getScrollPosition(): number {
    return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  updateTransform(scrollPosition: number) {
    const scaleValue = 1.05 - (scrollPosition / 400) * (1.05 - 0.95) * 1.7
    // const rotateValue = 14 - ((scrollPosition / 100) * 5.6)
    const rotateValue = 11 - ((scrollPosition / 100) * 2.6)
    const heightValue = 1020 - (scrollPosition / 100) * 150 //820
    const marginTopValue = (scrollPosition / 100) * 85 //170
    console.log("HEIGHT "+heightValue)
    if (scaleValue <= 0.95) {

      if (rotateValue <= 0) {
        const transformValue = "scale(" + 0.95 + ") rotateX(" + 0 + "deg) " +
          "translateZ(0px)";
        const screenElement = this.el.nativeElement.querySelector('.screen');
        screenElement.style.transform = transformValue;
        screenElement.style.height = 628 + "px";

        return
      }

      const transformValue = "scale(" + 0.95 + ") rotateX(" + rotateValue + "deg) " +
        "translateZ(0px)";
      const screenElement = this.el.nativeElement.querySelector('.screen');
      screenElement.style.transform = transformValue;
      return
    }
    // if (rotateValue <= 0) {
    //
    //   const transformValue = "scale(" + scaleValue + ") rotateX(" + 0 + "deg) " +
    //     "translateZ(0px)";
    //   const screenElement = this.el.nativeElement.querySelector('.screen');
    //   screenElement.style.transform = transformValue;
    //
    //   return
    // }
    // this.screenTransformCounter++

    const scaleYValue = 1 / Math.cos(rotateValue * Math.PI / 180);

    // console.log("SCROLL ")
    console.log(" SCROLLING " + scrollPosition)
    // const transformValue = "scaleX(" + scaleValue + ") scaleY("+ scaleYValue.toFixed(2)+") rotateX(" + rotateValue + "deg) " +
    //   "translateZ(0px)";
    const transformValue = "scale(" + scaleValue + ") rotateX(" + rotateValue + "deg) " +
      "translateZ(0px)";
    const screenElement = this.el.nativeElement.querySelector('.screen');
    screenElement.style.transform = transformValue;
    screenElement.style.height = heightValue + "px";
    screenElement.style.marginTop = marginTopValue + "px";

  }
}
