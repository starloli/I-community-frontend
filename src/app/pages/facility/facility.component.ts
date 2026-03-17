import { Facility } from './../../interface/interface';
import { Component } from '@angular/core';
import { HttpService } from '../../@service/http.service';

@Component({
  selector: 'app-facility',
  imports: [],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.scss'
})
export class FacilityComponent {

  constructor(private http: HttpService) { }

  getUrl = "http://localhost:8083/auth/facilities";
  facilities: Facility[] = [];

  getFacility() {
    this.http.getApi<Array<Facility>>(this.getUrl).subscribe(res => {
      if (res) {
        for (let r of res) {
          this.facilities.push(r);
        }
        console.log(this.facilities);
      }else{
        console.log("no data");
      }
    })
  }
}
