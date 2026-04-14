import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { Package } from '../interface/interface';
import { PackageStatus } from '../interface/enum';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class PackageService {

  private userUrl = '/user/package'
  private packagesSubject = new BehaviorSubject<Package[]>([]);
  packages$ = this.packagesSubject.asObservable();
  private userPackagesSubject = new BehaviorSubject<Package[]>([]);
  userPackages$ = this.userPackagesSubject.asObservable();

  constructor(private http: HttpService) {}

  getAll() {
    return this.http.getApi<Package[]>('/admin/package').pipe(
      tap(data => this.packagesSubject.next(data))
    );
  }

  getUserAll() {
    return this.http.getApi<Package[]>(this.userUrl).pipe(
      tap(data => this.userPackagesSubject.next(data))
    );
  }

  post(data: any) {
    const adminPayload = {
      recipientName: data.recipientName ?? data.user,
      unitNumber: data.unitNumber,
      trackingNumber: data.trackingNumber,
      courier: data.courier,
      arrivedAt: data.arrivedAt,
      notes: data.notes
    };

    const createPayload = {
      recipientName: data.recipientName ?? data.user,
      unitNumber: data.unitNumber,
      trackingNumber: data.trackingNumber,
      courier: data.courier,
      notes: data.notes
    };


    return this.http.postApi<any>('/admin/package', adminPayload).pipe(
      catchError((error) => {
        if (error.status === 404 || error.status === 405) {
          return this.http.postApi<any>('/package/create', createPayload);
        }

        return throwError(() => error);
      }),
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

  pickupById(id: number, pickupAt: string) {
    return this.http.putApi<any>(`${'/admin/package'}/${id}/pickup`, pickupAt)
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
