import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { Repo, SettingsFileType } from './models/repo.model';
import { INITIAL_REPOS } from './data/repos.data';
import { RepoCardComponent, OpenSettingsEvent } from './components/repo-card/repo-card.component';
import { AppsettingsModalComponent } from './components/appsettings-modal/appsettings-modal.component';
import { AddLinkModalComponent } from './components/add-link-modal/add-link-modal.component';
import { ToastComponent } from './components/toast/toast.component';

const PINNED_STORAGE_KEY = 'launchpad:pinned-repo-ids';

/** Reads previously pinned repo ids back out of localStorage (safe if it's empty, missing, or unavailable). */
function loadPinnedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(PINNED_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((v) => typeof v === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RepoCardComponent, AppsettingsModalComponent, AddLinkModalComponent, ToastComponent],
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

  /** Which card should show the "jumped here from a dependency chip" pulse right now. */
  highlightedRepoId = signal<string | null>(null);

  /** Starred repos — persisted in the browser so they survive a refresh, unlike everything else here. */
  pinnedIds = signal<Set<string>>(loadPinnedIds());

  toastMessage = signal<string | null>(null);

  private toastTimer?: ReturnType<typeof setTimeout>;
  private highlightTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Keep localStorage in sync whenever the pinned set changes.
    effect(() => {
      try {
        localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify([...this.pinnedIds()]));
      } catch {
        // Storage can be unavailable (private browsing, quota, etc.) — pinning still works for this session.
      }
    });
  }

  /** id -> display name, so a card can turn its `dependencies` ids into readable chips. */
  repoNameLookup = computed(() => new Map(this.repos().map((r) => [r.id, r.name])));

  filteredRepos = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.repos();
    return this.repos().filter(
      (r) => r.name.toLowerCase().includes(q) || r.team.toLowerCase().includes(q)
    );
  });

  /** Pinned repos surface in their own row above everything else. */
  pinnedRepos = computed(() => this.filteredRepos().filter((r) => this.pinnedIds().has(r.id)));
  otherRepos = computed(() => this.filteredRepos().filter((r) => !this.pinnedIds().has(r.id)));

  activeRepo = computed(() => this.repos().find((r) => r.id === this.activeRepoId()) ?? null);
  addLinkRepo = computed(() => this.repos().find((r) => r.id === this.addLinkRepoId()) ?? null);

  totalCount = computed(() => this.repos().length);

  onSearch(value: string): void {
    this.query.set(value);
  }

  // -- appsettings modal --------------------------------------------------

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

  // -- add-link modal (from the card's ⋮ menu) -----------------------------

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

  // -- pinning --------------------------------------------------------------

  togglePin(id: string): void {
    this.pinnedIds.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // -- dependency map ---------------------------------------------------------

  jumpToDependency(id: string): void {
    // If the target is hidden behind an active search, clear it first so the card exists to jump to.
    if (this.query() && !this.filteredRepos().some((r) => r.id === id)) {
      this.query.set('');
    }

    // Wait a tick for the DOM to reflect any query change above, then scroll + pulse.
    setTimeout(() => {
      document.getElementById(`repo-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.highlightedRepoId.set(id);
      clearTimeout(this.highlightTimer);
      this.highlightTimer = setTimeout(() => this.highlightedRepoId.set(null), 1500);
    }, 0);
  }

  // -- delete (from either the ⋮ menu or the appsettings modal) -----------

  deleteRepo(id: string): void {
    this.repos.update((list) => list.filter((r) => r.id !== id));
    this.pinnedIds.update((set) => {
      if (!set.has(id)) return set;
      const next = new Set(set);
      next.delete(id);
      return next;
    });
    this.activeRepoId.set(null);
    this.showToast('Repo removed from LaunchPad');
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage.set(null), 2200);
  }
}
