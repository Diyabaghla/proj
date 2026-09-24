import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Repo } from './models/repo.model';
import { INITIAL_REPOS } from './data/repos.data';
import { RepoCardComponent } from './components/repo-card/repo-card.component';
import { AppsettingsModalComponent } from './components/appsettings-modal/appsettings-modal.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RepoCardComponent, AppsettingsModalComponent, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  repos = signal<Repo[]>(INITIAL_REPOS);
  query = signal('');
  activeRepoId = signal<string | null>(null);
  toastMessage = signal<string | null>(null);

  private toastTimer?: ReturnType<typeof setTimeout>;

  filteredRepos = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.repos();
    return this.repos().filter(
      (r) => r.name.toLowerCase().includes(q) || r.team.toLowerCase().includes(q)
    );
  });

  activeRepo = computed(() => this.repos().find((r) => r.id === this.activeRepoId()) ?? null);

  totalCount = computed(() => this.repos().length);

  onSearch(value: string): void {
    this.query.set(value);
  }

  openAppSettings(repo: Repo): void {
    this.activeRepoId.set(repo.id);
  }

  closeModal(): void {
    this.activeRepoId.set(null);
  }

  saveAppSettings(update: { id: string; content: string }): void {
    this.repos.update((list) =>
      list.map((r) => (r.id === update.id ? { ...r, appSettings: update.content } : r))
    );
  }

  deleteRepo(id: string): void {
    this.repos.update((list) => list.filter((r) => r.id !== id));
    this.activeRepoId.set(null);
    this.showToast('Repo removed from LaunchPad');
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage.set(null), 2200);
  }
}
