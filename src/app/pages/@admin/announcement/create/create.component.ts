import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../@service/auth.service';
import { AnnouncementService } from '../../../../@service/announcement.service';

export function tomorrowValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const selected = new Date(control.value);

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return selected >= tomorrow ? null : { notTomorrowOrLater: true };
}

@Component({
  selector: 'app-create',
  standalone: true,
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
  mode: 'create' | 'edit' | 'preview' = 'create';
  id: number | null = null;
  minDateTime!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private service: AnnouncementService
  ) {}

  ngOnInit() {
    const now = new Date();

    // 明天 00:00
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    this.minDateTime = this.formatDate(tomorrow);

    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      category: ['', Validators.required],
      expiresAt: ['', [tomorrowValidator]],
      isPinned: [false]
    });

    // 判斷是不是 edit
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

  loadData(id: number) {
    function toDatetimeLocal(date: Date) {
      const pad = (n: number) => n.toString().padStart(2, '0');

      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
    this.service.getById(id).subscribe((res: any) =>
      {
        const date = res.expiresAt ? new Date(res.expiresAt + 'Z') : null;
        const data = {
          title: res.title,
          content: res.content,
          category: res.category,
          expiresAt: date ? toDatetimeLocal(date) : '',
          isPinned: res.isPinned
        };
        this.form.patchValue(data);
      });
  }

  goPreview() {
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
    if (this.form.invalid) return;

    const formValue = this.form.value;

    const payload = {
      ...formValue,
      expiresAt: formValue.expiresAt
        ? new Date(formValue.expiresAt)
        : null
    };

    if (this.id) {
      console.log('更新 API', this.id, payload);
      this.service.updateById(this.id, payload).subscribe({
        next: (res: any) => {
          console.log('成功', res);
        },
        error: (err: any) => {
          console.error('失敗', err.message);
        }
      });
    } else {
      console.log('新增 API', payload);
      this.service.postAnnoun(payload).subscribe({
        next: (res: any) => {
          console.log('成功', res);
        },
        error: (err: any) => {
          console.error('失敗', err.message);
        }
      });
    }
    this.router.navigate(['/admin/announcement']);
  }
}
