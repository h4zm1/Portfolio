import {Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, NgZone, HostListener} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {debounceTime, fromEvent, map, Subject, take, takeUntil, throttleTime} from "rxjs";
import {IMAGE_CONFIG, IMAGE_LOADER, ImageLoader, ImageLoaderConfig, NgOptimizedImage} from "@angular/common";


const myCustomLoader = (config: ImageLoaderConfig) => {
  let url = config.src;
  let queryParams = [];
  if (config.width) {
    queryParams.push(`w=${config.width}`);
  }
  if (config.loaderParams?.['roundedCorners']) {
    queryParams.push('mask=corners&corner-radius=5');
  }
  return url + queryParams.join('&');
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgOptimizedImage],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',


  providers: [
    {
      provide: IMAGE_CONFIG,
      useValue: {
        breakpoints: [380, 640, 1200, 1920, 2048, 3840],
        placeholderResolution: 25
      }
    },
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        return `${config.src}`;
      },
    },
  ],



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
    // all numbers are found and fixed with manual testing
    const scaleValue = 1.05 - (scrollPosition / 400) * (1.05 - 0.95) * 1.7
    const rotateValue = 20 - ((scrollPosition / 100) * 7.2)


    if (scaleValue <= 0.95) {
      // fix scale and rotation values cause both reached limit
      if (rotateValue <= 0) {
        const transformValue = "scale(" + 0.95 + ") rotateX(" + 0 + "deg) " +
          "translateZ(0px)";
        const screenElement = this.el.nativeElement.querySelector('.screen');
        screenElement.style.transform = transformValue;
        return
      }
      // fix only scale since it reaches it's limit before rotation
      const transformValue = "scale(" + 0.95 + ") rotateX(" + rotateValue + "deg) " +
        "translateZ(0px)";
      const screenElement = this.el.nativeElement.querySelector('.screen');
      screenElement.style.transform = transformValue;
      return
    }


    console.log(" SCROLLING " + scrollPosition)
    const transformValue = "scale(" + scaleValue + ") rotateX(" + rotateValue + "deg) " +
      "translateZ(0px)";
    const screenElement = this.el.nativeElement.querySelector('.screen');
    // apply transform value based on scrolling
    screenElement.style.transform = transformValue;
  }
}
