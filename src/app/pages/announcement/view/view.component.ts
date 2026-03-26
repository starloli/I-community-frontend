import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnnouncementService } from '../../../@service/announcement.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-view',
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent {

  constructor(
    private route: ActivatedRoute,
    private service: AnnouncementService
  ) {}
  id!: number;
  data!: any

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id'));
    });
    this.service.getById(this.id).subscribe((res: any) => {
      this.data = res;
    })
  }
}
