import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { API_URL } from '@shared/core/config/api.tokens';
import { RX_STOMP_CONFIG } from '@shared/core/config/stomp.config';
import { environment } from '../environments/environment';

export function rxStompConfigFactory() {
  const token = localStorage.getItem('token');
  const wsUrl = environment.apiUrl.replace('http', 'ws').replace('/api', '') + '/ws-la-vurger';
  return {
    brokerURL: wsUrl,
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
    provideHttpClient(withFetch()),
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: RX_STOMP_CONFIG, useFactory: rxStompConfigFactory },
  ],
};
