import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Repo } from '../../models/repo.model';

@Component({
  selector: 'app-add-link-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-link-modal.component.html',
  styleUrl: './add-link-modal.component.css',
})
export class AddLinkModalComponent {
  repo = input.required<Repo>();

  closed = output<void>();
  added = output<{ repoId: string; label: string; url: string }>();

  label = signal('');
  url = signal('');
  error = signal<string | null>(null);

  onBackdropClick(): void {
    this.close();
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    const label = this.label().trim();
    const url = this.url().trim();

    if (!label || !url) {
      this.error.set('Give the link a name and a URL.');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      this.error.set('URL should start with http:// or https://');
      return;
    }

    this.added.emit({ repoId: this.repo().id, label, url });
  }
}
