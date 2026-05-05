
import { Component, Inject, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { VisitorServiceService } from '../../@service/visitor-service.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-image',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
})
export class ImageComponent {
constructor(private dialogRef: MatDialogRef<ImageComponent>,private service:VisitorServiceService){}

image!:string;
readonly SERVER_URL = 'http://localhost:8083';
ngOnInit(): void {
this.image=this.service.image;
console.log('完整的圖片網址將會是:', this.SERVER_URL + this.image);

}

}
