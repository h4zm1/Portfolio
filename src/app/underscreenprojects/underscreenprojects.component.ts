import {AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2} from '@angular/core';
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
  hasAnimated = false; // track if animation happened or not

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
    if (this.hasAnimated) return // skip if already animated

    const element = this.el.nativeElement.querySelector('.title'); // get the DOM element

    if (!element || typeof element.getBoundingClientRect !== 'function') {
      return;
    }

    const rect = element.getBoundingClientRect() // return element size and position relative to viewport
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0 // check if the element is inside viewport

    if (isVisible) {
      this.animateLetters(element)
      this.hasAnimated = true
    }
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
