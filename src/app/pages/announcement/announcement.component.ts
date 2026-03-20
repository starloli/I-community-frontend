import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AnnouncementService } from '../../services/announcement.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface announcement {
  announcementId: number,
  title: string,
  category: string,
  publishedAt: Date,
  expiresAt?: Date,
  authorName: string,
  isPinned: boolean
}

@Component({
  selector: 'app-announcement',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './announcement.component.html',
  styleUrl: './announcement.component.scss'
})
export class AnnouncementComponent {

  announcements!: announcement[];
  private snackBar = inject(MatSnackBar);
  keyword = '';
  isAdmin = false;

  constructor(
    private auth: AuthService,
    private service: AnnouncementService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.service.getAll().subscribe();
    this.service.announs$.subscribe(data => {
      this.announcements = data;
    });
  }

  togglePin(user: any) {
    user.pinned = !user.pinned;
  }

  // 排序：置頂的在前 + 搜尋
  get filteredAnnouncements() {
    let list = this.announcements;

    // 搜尋
    if (this.keyword) {
      list = list.filter(announ =>
        announ.title.toLowerCase().includes(this.keyword.toLowerCase()) ||
        announ.category.toLowerCase().includes(this.keyword.toLowerCase())
      );
    }

    // 置頂排序（重點）
    return [...list].sort((a, b) => {
      return Number(b.isPinned) - Number(a.isPinned);
    });
  }

  delete(announ: any) {
    console.log("刪除:" + announ.announcementId)
    if (confirm(`確定要刪除問卷「${announ.title}」嗎？`)) {
      this.service.deleteById(announ.announcementId).subscribe(() => {
        this.snackBar.open('問卷已成功刪除', '關閉', { duration: 2000 });
      });
    }
  }

  loginAdmin() {
    this.auth.login('TestUser', '12345678').subscribe(res => {
      console.log('login success', res);
    });
  }

  loginUser() {
    this.auth.login('User', '12345678').subscribe(res => {
      console.log('login success', res);
    });
  }

  logout() {
    localStorage.setItem('token', '');
  }
}
