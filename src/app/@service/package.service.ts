import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { Package } from '../interface/interface';
import { PackageStatus } from '../interface/enum';

@Injectable({
  providedIn: 'root'
})
export class PackageService {

  private apiUrl = 'http://localhost:8083';
  private userUrl = 'http://localhost:8083/user/package'
  private packagesSubject = new BehaviorSubject<Package[]>([]);
  packages$ = this.packagesSubject.asObservable();
  private userPackagesSubject = new BehaviorSubject<Package[]>([]);
  userPackages$ = this.userPackagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Package[]>(this.apiUrl + '/admin/package').pipe(
      tap(data => this.packagesSubject.next(data))
    );
  }

  getUserAll() {
    return this.http.get<Package[]>(this.userUrl).pipe(
      tap(data => this.userPackagesSubject.next(data))
    );
  }

  post(data: any) {
    return this.http.post<any>(
        this.apiUrl + '/admin/package',
        {
          recipientName: data.user,
          unitNumber: data.unitNumber,
          trackingNumber: data.trackingNumber,
          courier: data.courier,
          arrivedAt: data.arrivedAt,
          notes: data.notes
        }
      ).pipe(
        tap(newItem => {
          const current = this.packagesSubject.value;
          this.packagesSubject.next([...current, newItem]);
        }),
        catchError((error) => {
          console.error('新增失敗', error);
          return throwError(() => error);
        })
      );
  }

  notifyById(id: number) {
    return this.http.put<any>(`${this.apiUrl + '/admin/package'}/${id}/notify`, null)
        .subscribe(() => {
          const current = this.packagesSubject.value;

          const updated = current.map(pkg =>
            pkg.id === id
              ? { ...pkg, isNotified: true }
              : pkg
          );

          this.packagesSubject.next(updated);
        });
  }

  pickupById(id: number, pickupAt: string) {
    return this.http.put<any>(`${this.apiUrl + '/admin/package'}/${id}/pickup`, pickupAt)
        .subscribe(() => {
          const current = this.packagesSubject.value;

          const updated = current.map(pkg =>
            pkg.id === id
              ? { ...pkg, status: PackageStatus.PICKED_UP, pickupAt: pickupAt }
              : pkg
          );

          this.packagesSubject.next(updated);
        });
  }
}
