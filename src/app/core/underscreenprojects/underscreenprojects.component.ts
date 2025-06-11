import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage } from "@angular/common";
import { MatIconModule } from '@angular/material/icon';

@Component({
<<<<<<< Updated upstream:src/app/underscreenprojects/underscreenprojects.component.ts
    selector: 'app-underscreenprojects',
    imports: [
        NgOptimizedImage
    ],
    templateUrl: './underscreenprojects.component.html',
    styleUrl: './underscreenprojects.component.scss'
=======
  selector: 'app-underscreenprojects',
  standalone: true,
  imports: [
    NgOptimizedImage,
    MatIconModule
  ],
  templateUrl: './underscreenprojects.component.html',
  styleUrl: './underscreenprojects.component.scss'
>>>>>>> Stashed changes:src/app/core/underscreenprojects/underscreenprojects.component.ts
})
export class UnderscreenprojectsComponent implements AfterViewInit {
  hasAnimatedTitles = new Set<HTMLElement>(); // track titles that already been animated
  platformID = inject(PLATFORM_ID)

  constructor(private el: ElementRef) {
  }

  ngAfterViewInit() {
    // there's no getBoundingClientRect on server side (will cause error), so limit the function call to client only
    if (isPlatformBrowser(this.platformID)) {
      this.checkVisibility()
    }
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.checkVisibility()
  }

  checkVisibility() {
    const elements = this.el.nativeElement.querySelectorAll('.title'); // get the DOM element

    if (!elements || elements.length === 0) {
      return // exit if no element are found
    }
    const elementsArray = Array.from<HTMLElement>(elements)

    elementsArray.forEach((element: HTMLElement) => {
      // skip the title if it's already been animated
      if (this.hasAnimatedTitles.has(element)) {
        return
      }
      if (!(element instanceof HTMLElement)) {
        console.warn('Skipping non-HTML element:', element);
        return;
      }
      const rect = element.getBoundingClientRect() // return element size and position relative to viewport
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0 // check if the element is inside viewport

      if (isVisible) {
        this.animateLetters(element)
        // mark title as animated to prevent re-animation
        this.hasAnimatedTitles.add(element)
      }
    })

  }

  animateLetters(element: HTMLElement) {
    const letter = element.textContent!.split('') // split the title into letters
    element.innerHTML = letter.map(letter => `<span>${letter}</span>`).join('') // wrap each letter in a span

    const spans = element.querySelectorAll('span')
    const transitionDuration = 0.5; // duration of the fade in effect for each letter (in sec)
    const overlapFactor = 0.2; // how much the letter trtansition overlap, so
    // if 0.5 will make next letter appear half way then 0.2 will make it appear bit earlier

    spans.forEach((span: HTMLElement, index: number) => {
      span.style.opacity = '0' // letters will start invisible
      span.style.transition = `opacity ${transitionDuration}s ease-in`; // fade in effect
      span.style.transitionDelay = `${index * transitionDuration * overlapFactor}s` // ensure the next letter will
      // start appearing before the current one finish appearing

      // delay to ensure initial styles are applied
      setTimeout(() => {
        span.style.opacity = '1'
      }, 10)
    })

    // add 'visible' class to parent element (that hold all spans)
    element.classList.add('visible')
  }
}
