import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="custom-toast" [ngClass]="data.type">
      <div class="toast-content">
        <div class="icon-wrapper">
          <!-- 成功動畫圖示 -->
          <svg *ngIf="data.type === 'success'" class="animated-icon success-icon" viewBox="0 0 52 52">
            <circle class="circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
          
          <!-- 錯誤動畫圖示 -->
          <svg *ngIf="data.type === 'error'" class="animated-icon error-icon" viewBox="0 0 52 52">
            <circle class="circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="line" fill="none" d="M17.3 17.3l17.4 17.4M34.7 17.3L17.3 34.7"/>
          </svg>

          <!-- 資訊/警告則保留 Material Icon 但加個簡單脈動動畫 -->
          <mat-icon *ngIf="data.type !== 'success' && data.type !== 'error'" class="pulse-icon">
            {{ data.icon }}
          </mat-icon>
        </div>
        <div class="text-wrapper">
          <span class="message">{{ data.message }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-toast {
      position: relative;
      min-width: 300px;
      max-width: 450px;
      background: rgba(241, 245, 249, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 
        0 18px 42px rgba(15, 23, 42, 0.16),
        0 8px 20px rgba(15, 23, 42, 0.08);
      overflow: hidden;
      padding: 14px 24px;
      display: flex;
      align-items: center;

      .toast-content {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
      }

      .icon-wrapper {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .text-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        
        .message {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.4;
          white-space: pre-line; /* 支援 \n 換行 */
          word-break: keep-all; /* 避免中文字斷開 */
        }
      }

      // 動畫圖示樣式
      .animated-icon {
        width: 32px;
        height: 32px;
        stroke-width: 4;
        stroke-miterlimit: 10;
        
        .circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-linecap: round;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        &.success-icon {
          stroke: #10b981;
          .check {
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            stroke-linecap: round;
            animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards;
          }
        }

        &.error-icon {
          stroke: #ef4444;
          .line {
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            stroke-linecap: round;
            animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards;
          }
        }
      }

      .pulse-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        animation: pulse 2s infinite;
      }

      &.info .pulse-icon { color: #5B7FA6; }
      &.warning .pulse-icon { color: #f59e0b; }
    }

    @keyframes stroke {
      to { stroke-dashoffset: 0; }
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }

    @media (max-width: 600px) {
      .custom-toast {
        min-width: 280px;
        width: 100%;
        max-width: none;
        margin: 0;
        background: rgba(226, 232, 240, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.32);
      }
    }
  `]
})
export class CustomToastComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string, type: string, icon: string }) {}
}
