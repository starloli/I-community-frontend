import { Component } from '@angular/core';
import { VisitorServiceService } from '../../@service/visitor-service.service';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-billsdialog',
  imports: [CommonModule],
  templateUrl: './billsdialog.component.html',
  styleUrl: './billsdialog.component.scss'
})
export class BillsdialogComponent {
  constructor(private service:VisitorServiceService,private http:ApiService){}
  bill!:any;

  ngOnInit(): void {
    this.bill=this.service.myBillId;
console.log( this.bill);

  }
}
