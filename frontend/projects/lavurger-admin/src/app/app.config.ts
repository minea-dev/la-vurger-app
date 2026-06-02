import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';

import { API_URL, APP_CONFIG, RX_STOMP_CONFIG } from '@shared';
import { environment } from '../environments/environment';

export function rxStompConfigFactory() {
  const token = localStorage.getItem('admin_token');
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
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),

    { provide: APP_CONFIG, useValue: environment },
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: RX_STOMP_CONFIG, useFactory: rxStompConfigFactory },
  ],
}
