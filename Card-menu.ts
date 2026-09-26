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
import { Repo } from '../../models/repo.model';

@Component({
  selector: 'app-card-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-menu.component.html',
  styleUrl: './card-menu.component.css',
})
export class CardMenuComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  repo = input.required<Repo>();

  addLink = output<Repo>();
  deleteRepo = output<string>();

  open = signal(false);
  confirmingDelete = signal(false);

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.open.update((v) => !v);
    if (!this.open()) {
      this.confirmingDelete.set(false);
    }
  }

  onAddLink(): void {
    this.addLink.emit(this.repo());
    this.close();
  }

  askDelete(): void {
    this.confirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  confirmDelete(): void {
    this.deleteRepo.emit(this.repo().id);
    this.close();
  }

  close(): void {
    this.open.set(false);
    this.confirmingDelete.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
