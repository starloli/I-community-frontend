import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../@service/auth.service';
import { AnnouncementService } from '../../../../@service/announcement.service';
import { AnnouncementPayload } from '../../../../interface/interface';

// 驗證公告截止時間至少要從明天 00:00 之後開始
export function nowOrLaterValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null | undefined;
  if (!value) return null;

  const safeValue: string = value;
  const selected = new Date(safeValue);

  const now = new Date();
  now.setSeconds(0, 0);

  return selected >= now ? null : { beforeNow: true };
}

@Component({
  selector: 'app-create',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    RouterLink
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {

  private router = inject(Router);
  form!: FormGroup;
  // mode 用來控制目前畫面是在新增、編輯或預覽狀態
  mode: 'create' | 'edit' | 'preview' = 'create';
  id: number | null = null;
  // datetime-local input 的最小可選時間
  minDateTime!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private service: AnnouncementService
  ) {}

  ngOnInit() {
    this.refreshMinDateTime();

    // 明天 00:00
    // 將最小截止時間設定為明天 00:00
    

    // 建立公告表單與驗證規則
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      category: ['', Validators.required],
      expiresAt: ['', [nowOrLaterValidator]],
      isPinned: [false]
    });

    // 判斷是不是 edit
    // 路由帶有 id 時代表進入編輯模式，先載入既有資料
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.mode = 'edit';
        this.id = Number(id);
        this.loadData(this.id);
      }
    });
  }

  formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  refreshMinDateTime(): void {
    const now = new Date();
    now.setSeconds(0, 0);
    this.minDateTime = this.formatDate(now);
  }

  toDateTimeLocalValue(dateStr?: string | null): string {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return this.formatDate(date);
  }

  loadData(id: number) {
    // 將後端日期格式轉成 datetime-local 可綁定的字串
    
    this.service.getById(id).subscribe((res: any) =>
      {
        const data = {
          title: res.title,
          content: res.content,
          category: res.category,
          expiresAt: this.toDateTimeLocalValue(res.expiresAt),
          isPinned: res.isPinned
        };
        this.form.patchValue(data);
      });
  }

  goPreview() {
    this.refreshMinDateTime();
    this.form.get('expiresAt')?.updateValueAndValidity();
    // 表單未通過驗證時，先顯示錯誤再阻止切到預覽
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.mode = 'preview';
  }

  backToEdit() {
    this.mode = this.id ? 'edit' : 'create';
  }

  submit() {
    this.refreshMinDateTime();
    this.form.get('expiresAt')?.updateValueAndValidity();
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const expiresAtValue = formValue.expiresAt;

    // 將表單資料整理成 API 需要的格式
    const payload: AnnouncementPayload = {
      ...formValue,
      expiresAt: typeof expiresAtValue === 'string' && expiresAtValue
        ? expiresAtValue
        : null
    };

    // 有 id 代表更新公告，否則為新增公告
    if (this.id) {
      this.service.updateById(this.id, payload).subscribe({
        next: (res: any) => {
          this.router.navigate(['/admin/announcement']);
        },
        error: (err: any) => {
          console.error('更新失敗', err.message);
        }
      });
    } else {
      this.service.postAnnoun(payload).subscribe({
        next: (res: any) => {
          this.router.navigate(['/admin/announcement']);
        },
        error: (err: any) => {
          console.error('新增失敗', err.message);
        }
      });
    }
  }
}
