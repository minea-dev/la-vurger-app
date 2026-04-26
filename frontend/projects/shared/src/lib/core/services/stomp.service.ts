import { Injectable, inject } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { RX_STOMP_CONFIG } from '../config/stomp.config';

@Injectable({
  providedIn: 'root'
})
export class StompService extends RxStomp {
  private config = inject(RX_STOMP_CONFIG);

  constructor() {
    super();
    this.configure(this.config);
    this.activate();
  }
}
