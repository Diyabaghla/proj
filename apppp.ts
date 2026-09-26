import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Repo, SettingsFileType } from './models/repo.model';
import { INITIAL_REPOS } from './data/repos.data';
import { RepoCardComponent, OpenSettingsEvent } from './components/repo-card/repo-card.component';
import { AppsettingsModalComponent } from './components/appsettings-modal/appsettings-modal.component';
import { AddLinkModalComponent } from './components/add-link-modal/add-link-modal.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RepoCardComponent, AppsettingsModalComponent, ToastComponent,AddLinkModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  repos = signal<Repo[]>(INITIAL_REPOS);
  query = signal('');
 
  activeRepoId = signal<string | null>(null);
  activeFileType = signal<SettingsFileType>('production');
 
  addLinkRepoId = signal<string | null>(null);
 
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
 addLinkRepo = computed(() => this.repos().find((r) => r.id === this.addLinkRepoId()) ?? null);
 
  totalCount = computed(() => this.repos().length);

  onSearch(value: string): void {
    this.query.set(value);
  }

  openAppSettings(event: OpenSettingsEvent): void {
    this.activeRepoId.set(event.repo.id);
    this.activeFileType.set(event.fileType);
  }

  closeModal(): void {
    this.activeRepoId.set(null);
  }

    saveAppSettings(update: { id: string; fileType: SettingsFileType; content: string }): void {
    this.repos.update((list) =>
      list.map((r) => {
        if (r.id !== update.id) return r;
        return update.fileType === 'local'
          ? { ...r, appSettingsLocal: update.content }
          : { ...r, appSettings: update.content };
      })
    );
  }

  openAddLink(repo: Repo): void {
    this.addLinkRepoId.set(repo.id);
  }
 
  closeAddLink(): void {
    this.addLinkRepoId.set(null);
  }
    addExtraLink(payload: { repoId: string; label: string; url: string }): void {
    this.repos.update((list) =>
      list.map((r) =>
        r.id === payload.repoId
          ? {
              ...r,
              extraLinks: [
                ...r.extraLinks,
                { id: `${payload.repoId}-${Date.now()}`, label: payload.label, url: payload.url },
              ],
            }
          : r
      )
    );
    this.addLinkRepoId.set(null);
    this.showToast(`"${payload.label}" added`);
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
