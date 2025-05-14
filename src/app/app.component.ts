import { Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, NgZone, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { debounceTime, fromEvent, map, Subject, take, takeUntil, throttleTime } from "rxjs";
import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoader, ImageLoaderConfig, NgOptimizedImage } from "@angular/common";
import { ScreenComponent } from "./screen/screen.component";



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgOptimizedImage, ScreenComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',

})
export class AppComponent {

}
