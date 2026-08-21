import { inject, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, map, forkJoin, catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private http = inject(HttpClient);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  registerIcons(): Observable<void> {
    // skip icon registeration on server
    if (!isPlatformBrowser(this.platformId)) {
      return of(void 0);
    }
    return this.http.get<Record<string, string>>('icons.config.json').pipe(
      tap((config) => {
        Object.entries(config).forEach(([name, path]) => {
          this.iconRegistry.addSvgIcon(
            name,
            this.sanitizer.bypassSecurityTrustResourceUrl(path),
          );
        });
      }),
      map(() => void 0), // Convert to Observable<void>
    );
  }
}
