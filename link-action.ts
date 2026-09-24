import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-link-action',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './link-action.component.html',
  styleUrl: './link-action.component.css',
})
export class LinkActionComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  label = input.required<string>();
  url = input.required<string>();
  variant = input<'primary' | 'teal'>('primary');

  copied = output<string>();

  open = signal(false);

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.open.update((v) => !v);
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.url());
      this.copied.emit(`${this.label()} link copied`);
    } catch {
      this.copied.emit('Could not copy — copy manually');
    }
    this.open.set(false);
  }

  openInBrowser(): void {
    window.open(this.url(), '_blank', 'noopener,noreferrer');
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
