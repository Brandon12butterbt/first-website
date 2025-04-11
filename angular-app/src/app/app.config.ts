import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

import { loadConfig } from './functions/config-loader';
import { EnvironmentService } from './services/environment.service';
import { ConfigService } from './services/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideHttpClient(),
    provideAnimations(),

    EnvironmentService,
    ConfigService,

    provideAppInitializer(() => {
      const envService = inject(EnvironmentService);
      const configService = inject(ConfigService);
      return loadConfig(envService, configService)();
    }),
  ],
};
