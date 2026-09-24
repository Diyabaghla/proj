import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message()) {
      <div class="toast" role="status">
        <span class="toast__dot"></span>
        {{ message() }}
      </div>
    }
  `,
  styles: [`
    .toast {
      position: fixed;
      left: 50%;
      bottom: 28px;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-ink);
      color: #fff;
      font-size: 13.5px;
      font-weight: 600;
      padding: 10px 16px;
      border-radius: 999px;
      box-shadow: var(--shadow-pop);
      z-index: 200;
      animation: toast-in 220ms var(--ease-out);
    }
    .toast__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6FE3B4;
      flex-shrink: 0;
    }
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(-50%) translateY(8px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `],
})
export class ToastComponent {
  message = input<string | null>(null);
}
