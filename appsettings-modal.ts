import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { Repo, SettingsFileType } from '../../models/repo.model';

@Component({
  selector: 'app-appsettings-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './appsettings-modal.component.html',
  styleUrl: './appsettings-modal.component.css',
})
export class AppsettingsModalComponent {
  repo = input.required<Repo>();
  /** Which settings file to show: 'production' -> appsettings.json, 'development' -> appsettings.development.json */
  fileType = input<SettingsFileType>('production');

  closed = output<void>();
  copied = output<string>();
  saved = output<{ id: string; fileType: SettingsFileType; content: string }>();
  deleted = output<string>();

  editing = signal(false);
  confirmingDelete = signal(false);
  draft = signal('');

  fileName = computed(() =>
    this.fileType() === 'development' ? 'appsettings.development.json' : 'appsettings.json'
  );

  lineCount = computed(() => this.draft().split('\n').length);

  private currentContent(): string {
    return this.fileType() === 'development'
      ? this.repo().appSettingsDevelopment
      : this.repo().appSettings;
  }

  constructor() {
    effect(() => {
      // Reset local editor state whenever a different repo/file is opened.
      this.draft.set(this.currentContent());
      this.editing.set(false);
      this.confirmingDelete.set(false);
    });
  }

  onBackdropClick(): void {
    this.close();
  }

  close(): void {
    this.closed.emit();
  }

  startEdit(): void {
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.draft.set(this.currentContent());
    this.editing.set(false);
  }

  saveEdit(): void {
    this.saved.emit({ id: this.repo().id, fileType: this.fileType(), content: this.draft() });
    this.editing.set(false);
    this.copied.emit(`${this.fileName()} saved`);
  }

  async copyAll(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.draft());
      this.copied.emit(`${this.fileName()} copied`);
    } catch {
      this.copied.emit('Could not copy — copy manually');
    }
  }

  askDelete(): void {
    this.confirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  confirmDelete(): void {
    this.deleted.emit(this.repo().id);
  }
}
