import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResidentStateService {
  private incompleteCountSubject = new BehaviorSubject<number>(0);
  incompleteCount$ = this.incompleteCountSubject.asObservable();

  setIncompleteCount(count: number): void {
    this.incompleteCountSubject.next(count);
  }
}
