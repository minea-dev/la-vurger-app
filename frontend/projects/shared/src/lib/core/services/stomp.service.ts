import { Injectable, OnDestroy } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { myRxStompConfig } from '../config/stomp.config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StompService implements OnDestroy {
  private rxStomp: RxStomp;

  constructor() {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure(myRxStompConfig);
    this.rxStomp.activate();
  }

  public watch<T>(topic: string): Observable<T> {
    return this.rxStomp.watch(topic).pipe(
      map((message) => {
        return JSON.parse(message.body) as T;
      })
    );
  }

  public publish(destination: string, body: any): void {
    this.rxStomp.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  ngOnDestroy(): void {
    this.rxStomp.deactivate();
  }
}
