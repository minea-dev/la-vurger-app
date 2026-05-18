import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

import { API_URL, APP_CONFIG, RX_STOMP_CONFIG, authInterceptor } from '@shared';
import { environment } from '../environments/environment';

export function rxStompConfigFactory() {
  const token = localStorage.getItem('auth_token');
  return {
    brokerURL: environment.wsUrl,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    heartbeatIncoming: 0,
    heartbeatOutgoing: 20000,
    reconnectDelay: 5000,
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: APP_CONFIG, useValue: environment },

    { provide: API_URL, useValue: environment.apiUrl },
    { provide: RX_STOMP_CONFIG, useFactory: rxStompConfigFactory },
  ],
};
