import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Repo } from '../../models/repo.model';
import { LinkActionComponent } from '../link-action/link-action.component';

@Component({
  selector: 'app-repo-card',
  standalone: true,
  imports: [LinkActionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './repo-card.component.html',
  styleUrl: './repo-card.component.css',
})
export class RepoCardComponent {
  repo = input.required<Repo>();
  index = input<number>(0);

  copied = output<string>();
  openAppSettings = output<Repo>();

  initials = computed(() =>
    this.repo()
      .name.replace(/[a-z]/g, '')
      .slice(0, 2) || this.repo().name.slice(0, 2).toUpperCase()
  );

  onOpenAppSettings(): void {
    this.openAppSettings.emit(this.repo());
  }
}
