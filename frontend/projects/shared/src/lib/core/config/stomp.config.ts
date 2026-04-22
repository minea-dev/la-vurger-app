import { RxStompConfig } from '@stomp/rx-stomp';

export function rxStompConfigFactory(): RxStompConfig {
  const token = localStorage.getItem('token');

  return {
    brokerURL: 'ws://localhost:8080/ws-la-vurger',

    connectHeaders: token ? {
      Authorization: `Bearer ${token}`
    } : {},

    heartbeatIncoming: 0,
    heartbeatOutgoing: 20000,
    reconnectDelay: 5000,

    debug: (msg: string): void => {
      console.log(new Date(), msg);
    },
  };
}
