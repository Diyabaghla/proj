import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Repo, SettingsFileType } from '../../models/repo.model';
import { LinkActionComponent } from '../link-action/link-action.component';
import { CardMenuComponent } from '../card-menu/card-menu.component';

/** Payload emitted when a settings-file chip is clicked. */
export interface OpenSettingsEvent {
  repo: Repo;
  fileType: SettingsFileType;
}

/** A resolved dependency, ready to render as a chip. */
export interface DependencyChip {
  id: string;
  name: string;
}

@Component({
  selector: 'app-repo-card',
  standalone: true,
  imports: [LinkActionComponent, CardMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './repo-card.component.html',
  styleUrl: './repo-card.component.css',
})
export class RepoCardComponent {
  repo = input.required<Repo>();
  index = input<number>(0);
  /** Map of repo id -> display name, used to turn dependency ids into readable chips. */
  repoNames = input.required<Map<string, string>>();
  /** Whether this card is starred/pinned. */
  pinned = input<boolean>(false);
  /** Set when another card's dependency chip just pointed here — drives the highlight pulse. */
  highlightedId = input<string | null>(null);

  copied = output<string>();
  openAppSettings = output<OpenSettingsEvent>();
  addLink = output<Repo>();
  deleteRepo = output<string>();
  togglePin = output<string>();
  jumpToDependency = output<string>();

  initials = computed(() =>
    this.repo()
      .name.replace(/[a-z]/g, '')
      .slice(0, 2) || this.repo().name.slice(0, 2).toUpperCase()
  );

  isHighlighted = computed(() => this.highlightedId() === this.repo().id);

  dependencyChips = computed<DependencyChip[]>(() => {
    const names = this.repoNames();
    return this.repo().dependencies.map((id) => ({ id, name: names.get(id) ?? id }));
  });

  onOpenAppSettings(fileType: SettingsFileType): void {
    this.openAppSettings.emit({ repo: this.repo(), fileType });
  }
}
