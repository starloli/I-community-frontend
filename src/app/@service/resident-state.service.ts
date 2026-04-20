import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResidentStateService {
  private hasIncompleteResidentSubject = new BehaviorSubject<boolean>(false);
  hasIncompleteResident$ = this.hasIncompleteResidentSubject.asObservable();

  setIncompleteStatus(status: boolean): void {
    this.hasIncompleteResidentSubject.next(status);
  }
}
