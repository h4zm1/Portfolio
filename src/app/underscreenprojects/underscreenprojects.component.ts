import {AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";

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

  constructor(private el: ElementRef) {
  }

  ngAfterViewInit() {
    this.checkVisibility()
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
    const elementsArray = Array.from<HTMLElement>(elements).filter(
      (node) => node instanceof HTMLElement
    )

    console.warn('ERROR ELEMENT LENGTH :: ' + elements.length);
    // console.log('*************************************Elements:', elements);
    // console.log('Element:', element);
    elementsArray.forEach((element: HTMLElement) => {

      // skip the title if it's already been animated
      if (this.hasAnimatedTitles.has(element)) {
        return
      }
      console.log('Element:', element);
      console.log('Is HTMLElement:', element instanceof HTMLElement);
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
