import { InjectionToken } from '@angular/core';
import { AppEnvironment } from '@shared';

export const API_URL = new InjectionToken<string>('API_URL');
export const APP_CONFIG = new InjectionToken<AppEnvironment>('APP_CONFIG');
