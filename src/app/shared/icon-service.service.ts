import { inject, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, map, forkJoin, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private http = inject(HttpClient);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  loadIconsFromJson(jsonPath: string): Observable<void> {
    return this.http.get<IconConfig[]>(jsonPath).pipe(
      map(icons => {
        const iconLoaders = icons.map(icon =>
          this.registerIcon(icon.name, icon.path, icon.namespace)
        );
        return forkJoin(iconLoaders);
      }),
      map(() => void 0),
      catchError(error => {
        console.error('Error loading icons:', error);
        return of(void 0);
      })
    );
  }

  private registerIcon(name: string, path: string, namespace?: string): Observable<void> {
    return this.http.get(path, { responseType: 'text' }).pipe(
      map(svg => {
        if (namespace) {
          this.iconRegistry.addSvgIconInNamespace(
            namespace,
            name,
            this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/svg+xml;base64,${btoa(svg)}`)
          );
        } else {
          this.iconRegistry.addSvgIcon(
            name,
            this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/svg+xml;base64,${btoa(svg)}`)
          );
        }
      }),
      catchError(error => {
        console.error(`Error loading icon ${name}:`, error);
        return of(void 0);
      })
    );
  }
}

interface IconConfig {
  name: string;
  path: string;
  namespace?: string;
}

