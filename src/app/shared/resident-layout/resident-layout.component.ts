import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ResidentSidebarComponent } from '../resident-sidebar/resident-sidebar.component';

@Component({
  selector: 'app-resident-layout',
  standalone: true,
  imports: [RouterOutlet, ResidentSidebarComponent],
  templateUrl: './resident-layout.component.html',
  styleUrl: './resident-layout.component.scss'
})
export class ResidentLayoutComponent {}
