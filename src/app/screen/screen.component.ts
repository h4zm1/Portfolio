import {Component, ElementRef, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {
  IMAGE_CONFIG,
  IMAGE_LOADER,
  ImageLoaderConfig,
  isPlatformBrowser,
  NgForOf,
  NgOptimizedImage
} from "@angular/common";
import {UnderscreenprojectsComponent} from "../underscreenprojects/underscreenprojects.component";
import {fromEvent, map, Subject, takeUntil} from "rxjs";
import {UnderscreencardComponent} from "../underscreencard/underscreencard.component";
import {trigger, transition, style, animate, state} from '@angular/animations';

@Component({
  selector: 'app-screen',
  standalone: true,
  imports: [
    NgOptimizedImage,
    UnderscreenprojectsComponent,
    UnderscreencardComponent,
    NgForOf
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
  animations: [
    trigger('letterState', [
      state('in', style({
        transform: 'translateY(0) scale(1)',
        filter: 'blur(0px)',
      })),
      state('out', style({
        transform: 'translateY(-100%) scale(0.7)',
        filter: 'blur(12px)',
      })),
      state('incoming', style({
        transform: 'translateY(190%) scale(0.7)',
        filter: 'blur(12px)',
      })),
      transition('in => out', animate('800ms cubic-bezier(0.9, 0, 0.1, 1)')),
      transition('incoming => in', animate('800ms cubic-bezier(0.9, 0, 0.1, 1)'))
    ])
  ]
})
export class ScreenComponent implements OnInit, OnDestroy {
  private intervalId: any;
  state = 'start';
  firstWord = 'Clicking';
  secondWord = 'Scrolling';
  displayedText: Array<{ char: string, id: number }> = [];
  letterStates: string[] = [];
  loopInterval: any;
  currentWordIndex: number = 0;

  ngOnInit() {
    if (isPlatformBrowser(this.platformID)) {
      // reset scrolling position from localstorage
      const scrollPosition = localStorage.getItem('scrollPosition');
      if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition, 10));
      }
      console.log("scroll position oninit " + this.getScrollPosition());
      this.updateTransformScreen(this.getScrollPosition())
      const scrollEvent = fromEvent(window, "scroll").pipe(
        // throttleTime(1000),
        // debounceTime(100),
        map(() => window.scrollY || document.documentElement.scrollTop ||
          document.body.scrollTop || 0),
        takeUntil(this.destroy),
        // take(6)
      )

      scrollEvent.subscribe(scrollPosition => {
        this.updateTransformScreen(scrollPosition) // screen transform
        this.updateTransformInnerContent(scrollPosition) // inner screen content transform
        this.updateTransformTitle(scrollPosition) // top title transform
      })

      // displayedText will be like this [{'C',0}, {'L',0}, {'I',0}, {'C',0}...]
        this.displayedText = Array(this.firstWord.length).fill('').map((_, i) =>
          this.createLetterObj(this.firstWord[i], this.currentWordIndex)
        );
      // and letterStates will be like this ['in','in','in','in','in','in','in','in']
      this.letterStates = new Array(this.displayedText.length).fill('in');
      // without restricting setInterval() to client side, the webpage will get timed out
      // Start animation after a delay
      setTimeout(() => this.startLoop(), 1000);
    }
  }

  startLoop() {
    // run the animation every 3 seconds
    this.animateWordChange();
    this.loopInterval = setInterval(() => {
      this.animateWordChange();
    }, 3000);
  }
  // this's a fix to ensures that even if the same letter appears in both words at the same position,
  // angular will see them as different objects cause they have different id values, triggering animatio properly
  createLetterObj = (char: string, id: number) => {
    return {
      char: char || '',
      id: id // this should be enough for angular to see it as different
    };
  };
  animateWordChange() {
    // Determine current and next word
    const currentWord = this.currentWordIndex === 0 ? this.firstWord : this.secondWord;
    const nextWord = this.currentWordIndex === 0 ? this.secondWord : this.firstWord;
    const maxLength = Math.max(currentWord.length, nextWord.length);

    // the idea is
    // in => out: the letter move up and disappears
    // out => incoming: the letter reset to the incoming position
    // incoming => in: the letter move up into its final position
    // switch words
    //////////=== STEPS ===////////
    // 1; first letter (i = 0)
    // animate 'C' out ('out' state)
    // replace 'C' with 'S' and animate it in ('incoming' and 'in' state)
    //2; second letter (i=1)
    // animate 'L' out ('out' state)
    //.....

    // animate each letter sequentially
    for (let i = 0; i < maxLength; i++) {
      setTimeout(() => {
        // step 1;; animate current letter out
        this.letterStates[i] = 'out';

        // step 2;; after it get out we replace it with new letter from the next word
        setTimeout(() => {
          // create a new letter object from the next word
          this.displayedText[i] = this.createLetterObj(
            nextWord[i],
            this.currentWordIndex
          );
          this.letterStates[i] = 'incoming';

          // step 3;; animate the new letter in
          setTimeout(() => {
            this.letterStates[i] = 'in';
          }, 80);
        }, 300);// delay to give time to for "out" letters to animate
      }, i * 120);// delay between the start of each letter's animation
    }

    // step 4;; toggle the current word index for the next animation
    setTimeout(() => {
      this.currentWordIndex = this.currentWordIndex === 0 ? 1 : 0;
    }, maxLength * 120); // total delay for all animations to complete (well not counting the 400ms for out+inc=>in)
  }

  clearTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformID)) {
      // Save scroll position before leaving the page
      localStorage.setItem('scrollPosition', window.pageYOffset.toString());


      // clear timer when component is destroyed
      this.clearTimer();
      if (this.loopInterval) {
        clearInterval(this.loopInterval);
      }
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
  updateTransformScreen(scrollPosition: number) {
    // all numbers are found and fixed with manual testing
    const scaleValue = 1.05 - (scrollPosition / 400) * (1.05 - 0.95) * 1.7
    const rotateValue = 20 - ((scrollPosition / 100) * 9.3)
    const translateValue = -scrollPosition * -0.17

    // scaleValue goes from 0.95 (when the screen is flat) to 1.05 (when the screen is tilted)
    // the idea is to do not rotate/tilt the screen when scaleValue <= 0.95 (scrolling downward past the screen)
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


    // console.log(" SCROLLING " + scaleValue + "ROTATION " + rotateValue)
    console.log(" translate " + translateValue)
    const transformValue = "scale(" + scaleValue + ") rotateX(" + rotateValue + "deg) " +
      "translateZ(0px)" + "translateY(" + translateValue + "px)";
    const screenElement = this.el.nativeElement.querySelector('.screen');
    // apply transform value based on scrolling
    screenElement.style.transform = transformValue;
  }

  // translate 'screenGrid' on the y axis like a small parallax effect
  updateTransformInnerContent(scrollPosition: number) {
    const translateValue = -scrollPosition * 0.25

    // limit content translation to this scrolling position
    if (translateValue < -102)
      return
    // console.log(" TRANSLATE " + translateValue)
    const transformValue = "scale(" + 1 + ") rotateX(" + 0 + "deg) " +
      "translateY(" + translateValue + "px)";
    const screenElement = this.el.nativeElement.querySelector('.screenGrid');
    // apply transform value based on scrolling
    screenElement.style.transform = transformValue;
  }

  //
  updateTransformTitle(scrollPosition: number) {
    const translateValue = -scrollPosition * 0.44
    // limit content translation to this scrolling position
    if (translateValue < -102)
      return

    console.log(" TITLE--TRANSLATE " + translateValue)
    const transformValue = "scale(" + 1 + ") rotateX(" + 0 + "deg) " +
      "translateY(" + translateValue + "px)";
    const titleElement = this.el.nativeElement.querySelector('.screenTitle');
    // apply transform value based on scrolling
    titleElement.style.transform = transformValue;


  }

}
