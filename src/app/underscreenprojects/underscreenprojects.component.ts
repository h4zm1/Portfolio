import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  PLATFORM_ID
} from '@angular/core';
import {isPlatformBrowser, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-underscreenprojects',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './underscreenprojects.component.html',
  styleUrl: './underscreenprojects.component.scss'
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
    spans.forEach((span: HTMLElement, index: number) => {
      // apply styles into each letter
      span.style.transitionDelay = `${index * 0.1}s`
      span.style.opacity = '0'

      // delay to insure initial styles are applied
      setTimeout(() => {
        span.style.opacity = '1'
      }, 10)
    })

    // add 'visible' class to parent element (that hold all spans)
    element.classList.add('visible')
  }
}
