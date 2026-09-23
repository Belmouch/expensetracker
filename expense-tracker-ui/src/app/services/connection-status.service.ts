import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionStatusService {
  private activeRetries = 0;
  private readonly reconnectingSubject = new BehaviorSubject<boolean>(false);

  readonly reconnecting$ = this.reconnectingSubject.asObservable();

  startRetry(): void {
    this.activeRetries++;
    this.reconnectingSubject.next(true);
  }

  endRetry(): void {
    this.activeRetries = Math.max(0, this.activeRetries - 1);

    if (this.activeRetries === 0) {
      this.reconnectingSubject.next(false);
    }
  }
}
