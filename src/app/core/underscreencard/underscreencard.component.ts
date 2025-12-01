import {Component, OnInit} from '@angular/core';
import { NgStyle} from "@angular/common";

interface MeteorStyle {
  id: number;
  style: {
    '--top': string;
    '--left': string;
    '--duration': string;
  };
}

@Component({
    selector: 'app-underscreencard',
  imports: [
    NgStyle
  ],
    templateUrl: './underscreencard.component.html',
    styleUrl: './underscreencard.component.scss'
})
export class UnderscreencardComponent implements OnInit{
  meteors: MeteorStyle[] = [];
  meteorCount = 15;

  ngOnInit() {
    this.generateMeteorStyles();
  }

  generateMeteorStyles() {
    for (let i = 0; i < this.meteorCount; i++) {
      const v = Math.random() * 100 - 35; // left (-35% to 65%)
      const h = Math.random() * 350 * -1; // top (0 to -350px)
      const d = Math.random() * 5 + 2; // duration (2s to 7s)

      this.meteors.push({
        id: i,
        style: {
          '--top': `${h}px`,
          '--left': `${v}%`,
          '--duration': `${d}s`
        }
      });
    }
  }
}
