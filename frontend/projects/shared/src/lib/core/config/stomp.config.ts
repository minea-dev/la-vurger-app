import { InjectionToken } from '@angular/core';
import { RxStompConfig } from '@stomp/rx-stomp';

export const RX_STOMP_CONFIG = new InjectionToken<RxStompConfig>('RX_STOMP_CONFIG');
