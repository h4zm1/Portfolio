import { NgOptimizedImage } from "@angular/common";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScreenComponent } from "./core/screen/screen.component";



@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NgOptimizedImage, ScreenComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {

}
