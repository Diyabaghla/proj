import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Repo, SettingsFileType } from '../../models/repo.model';
import { LinkActionComponent } from '../link-action/link-action.component';
import { CardMenuComponent } from '../card-menu/card-menu.component';
/** Payload emitted when a settings-file chip is clicked. */
export interface OpenSettingsEvent {
  repo: Repo;
  fileType: SettingsFileType;
}
export interface DependencyChip {
  id: string;
  name: string;
}

@Component({
  selector: 'app-repo-card',
  standalone: true,
  imports: [LinkActionComponent,CardMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './repo-card.component.html',
  styleUrl: './repo-card.component.css',
})
export class RepoCardComponent {
  repo = input.required<Repo>();
  index = input<number>(0);

  copied = output<string>();
  addLink = output<Repo>();
  deleteRepo = output<string>();
  openAppSettings = output<OpenSettingsEvent>();

  initials = computed(() =>
    this.repo()
      .name.replace(/[a-z]/g, '')
      .slice(0, 2) || this.repo().name.slice(0, 2).toUpperCase()
  );

  onOpenAppSettings(fileType: SettingsFileType): void {
    this.openAppSettings.emit({ repo: this.repo(), fileType });
  }
}
