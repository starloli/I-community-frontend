import { Facility } from './../../interface/interface';
import { Component } from '@angular/core';
import { HttpService } from '../../@service/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RegistFacilityComponent } from '../../dialog/regist-facility/regist-facility.component';

@Component({
  selector: 'app-facility',
  imports: [],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.scss'
})
export class FacilityComponent {

  constructor(private http: HttpService, private snackBar: MatSnackBar, private dialog: MatDialog) { }

  getUrl = "http://localhost:8083/auth/facilities";
  facilities: Facility[] = [];

  registFacility() {
    const dialogRef = this.dialog.open(RegistFacilityComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
          this.getFacility();
      }
    });

  }

  ngOnInit() {
    this.getFacility();
  }

  getFacility() {
    this.facilities = [];
    this.http.getApi<Array<Facility>>(this.getUrl).subscribe(res => {
      if (res) {
        for (let r of res) {
          this.facilities.push(r);
        }
        console.log(this.facilities);
      } else {
        console.log("no data");
      }
    }, err => {
      this.snackBar.open('發生錯誤，錯誤代碼：' + err.status, '關閉', {
        duration: 2000,
      });
      console.log(err);
    })
  }
}
