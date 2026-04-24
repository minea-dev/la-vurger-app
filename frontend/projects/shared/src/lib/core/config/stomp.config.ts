import { InjectionToken } from '@angular/core';
import { RxStompConfig } from '@stomp/rx-stomp';
import { environment } from '../../../../../lavurger-client/src/environments/environment';

export const RX_STOMP_CONFIG = new InjectionToken<RxStompConfig>('RX_STOMP_CONFIG');

export const stompConfig: RxStompConfig = {
  brokerURL: environment.apiUrl.replace('http', 'ws') + '/ws-la-vurger',

  connectHeaders: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },

  heartbeatIncoming: 0,
  heartbeatOutgoing: 20000,
  reconnectDelay: 5000,

  debug: (msg: string): void => {
    // console.log(new Date(), msg);
  },
};
