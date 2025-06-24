import { NgOptimizedImage } from "@angular/common";
import { Component } from '@angular/core';
import { ScreenComponent } from "./core/screen/screen.component";
import { RouterOutlet } from "@angular/router";



@Component({
  selector: 'app-root',
  imports: [NgOptimizedImage, ScreenComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
