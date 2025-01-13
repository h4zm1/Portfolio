import {Component, ElementRef, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {IMAGE_CONFIG, IMAGE_LOADER, ImageLoaderConfig, NgOptimizedImage} from "@angular/common";
import {UnderscreenprojectsComponent} from "../underscreenprojects/underscreenprojects.component";
import {fromEvent, map, Subject, takeUntil} from "rxjs";
import {UnderscreencardComponent} from "../underscreencard/underscreencard.component";

@Component({
  selector: 'app-screen',
  standalone: true,
  imports: [
    NgOptimizedImage,
    UnderscreenprojectsComponent,
    UnderscreencardComponent
  ],
  templateUrl: './screen.component.html',
  styleUrl: './screen.component.scss',
  providers: [
    {
      provide: IMAGE_CONFIG,
      useValue: {
        breakpoints: [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
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
export class ScreenComponent implements OnInit, OnDestroy {
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
        this.updateTransformInnerContent(scrollPosition)
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

  // update the transform values (rotation and scale) of 'screen'
  // element/class based on the scrolling
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


    console.log(" SCROLLING " + scaleValue + "ROTATION " + rotateValue)
    const transformValue = "scale(" + scaleValue + ") rotateX(" + rotateValue + "deg) " +
      "translateZ(0px)";
    const screenElement = this.el.nativeElement.querySelector('.screen');
    // apply transform value based on scrolling
    screenElement.style.transform = transformValue;
  }

  // translate 'screenGrid' on the y axis like a small parallax effect
  updateTransformInnerContent(scrollPosition: number) {
    const translateValue = -scrollPosition * 0.25

    if (translateValue < -102)
      return
    // console.log(" TRANSLATE " + translateValue)
    const transformValue = "scale(" + 1 + ") rotateX(" + 0 + "deg) " +
      "translateY(" + translateValue + "px)";
    const screenElement = this.el.nativeElement.querySelector('.screenGrid');
    // apply transform value based on scrolling
    screenElement.style.transform = transformValue;
  }
}
