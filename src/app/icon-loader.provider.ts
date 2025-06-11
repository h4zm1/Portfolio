// icon-loader.provider.ts
import { APP_INITIALIZER, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IconService } from './shared/icon-service.service';

export function provideIconLoader() {
  return {
    provide: APP_INITIALIZER,
    useFactory: (svgIconService: IconService, platformId: Object) => {
      return () => {
        // Only load icons on the browser to avoid SSR issues
        if (isPlatformBrowser(platformId)) {
          return svgIconService.loadIconsFromJson('/assets/icons.json');
        }
        return Promise.resolve();
      };
    },
    deps: [IconService, PLATFORM_ID],
    multi: true
  };
}

