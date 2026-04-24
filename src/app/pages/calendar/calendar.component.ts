import { Component, computed, signal } from '@angular/core';
import { DayCell, Holiday } from '../../interface/interface';
import { HolidayService } from '../../@service/holiday-service';
import { AuthService } from '../../@service/auth.service';

@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {

  today = new Date();

  year = signal(this.today.getFullYear());
  month = signal(this.today.getMonth()); // 0-based

  holidays = signal<Holiday[]>([]);
  events = signal<Holiday[]>([]);

  selectedDate = signal<string | null>(null);

  isAdmin: boolean = false;

  constructor(
    private service: HolidayService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadHolidays();
    this.loadEvents();
    this.isAdmin = this.auth.isAdmin();
  }

  // 🔁 載入當月假日
  loadHolidays() {
    const start = `${this.year()}-${this.pad(this.month()+1)}-01`;

    this.service.getHolidays(start)
      .subscribe(res => this.holidays.set(res));
  }

  loadEvents() {
    const start = `${this.year()}-${this.pad(this.month()+1)}-01`;

    this.service.getEvents(start)
      .subscribe(res => this.events.set(res));
  }

  // 📅 計算月曆 grid
  days = computed<DayCell[]>(() => {
    const y = this.year();
    const m = this.month();

    const firstDay = new Date(y, m, 1);
    const startDay = firstDay.getDay(); // 0=Sun

    const result: DayCell[] = [];

    // 前一個月補位
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(y, m, -i);
      result.push(this.buildCell(d, false));
    }

    // 本月
    const lastDate = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= lastDate; d++) {
      const date = new Date(y, m, d);
      result.push(this.buildCell(date, true));
    }

    // 補滿 42 格
    while (result.length < 42) {
      const last = result[result.length - 1].date;
      const next = new Date(last);
      next.setDate(last.getDate() + 1);
      result.push(this.buildCell(next, false));
    }

    return result;
  });

  private buildCell(date: Date, inMonth: boolean): DayCell {
    const dateStr = this.format(date);

    const holiday = this.holidays().find(h => h.date === dateStr);

    const events = this.events().filter(e => e.date === dateStr) || [];

    return {
      date,
      inMonth,
      isToday: this.format(date) === this.format(this.today),
      holiday,
      events
    };
  }

  // 🔧 util
  format(d: Date): string {
    return `${d.getFullYear()}-${this.pad(d.getMonth()+1)}-${this.pad(d.getDate())}`;
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  // ⏩ 月切換
  prevMonth() {
    if (this.month() === 0) {
      this.year.set(this.year() - 1);
      this.month.set(11);
    } else {
      this.month.set(this.month() - 1);
    }
    this.loadHolidays();
    this.loadEvents();
  }

  nextMonth() {
    if (this.month() === 11) {
      this.year.set(this.year() + 1);
      this.month.set(0);
    } else {
      this.month.set(this.month() + 1);
    }
    this.loadHolidays();
    this.loadEvents();
  }

  selectDay(day: DayCell) {
    const date = this.format(day.date);

    if (this.selectedDate() === date || !day.inMonth) {
      this.selectedDate.set(null);
    } else {
      this.selectedDate.set(date);
    }
  }

  selectedEvents = computed(() => {
    const date = this.selectedDate();
    if (!date) return [];

    return this.events().filter(e => e.date === date) || [];
  });

  newEventTitle = signal('');

  addEvent() {
    const date = this.selectedDate();
    const title = this.newEventTitle().trim();

    if (!date || !title) return;

    this.service.postEvent({ 'date': date, 'title': title })
      .subscribe(res => {
        // 👉 更新本地資料（不用重抓）
        this.events.update(events => [...events, res]);

        // 清空 input
        this.newEventTitle.set('');
      });
  }

  deleteEvent(e: Holiday) {
    this.service.deleteEvent(e.id).subscribe(() => {
      this.events.update(events => events.filter(x => x.id !== e.id));
    });
  }
}
