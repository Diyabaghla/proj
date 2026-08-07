import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface FeatureItem {
  title: string;
  desc: string;
  icon: SafeHtml;
}

interface WorkflowStep {
  num: number;
  title: string;
  desc: string;
  tag: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
  encapsulation: ViewEncapsulation.None,
})
export class LandingPageComponent implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject(ElementRef<HTMLElement>);

  private observer?: IntersectionObserver;

  isScrolled = false;
  isProfileOpen = false;

  readonly features: FeatureItem[] = [
    {
      title: 'Secure document upload',
      desc: 'Drag in W-2s, 1099s, and prior returns — stored encrypted against your envelope ID.',
      icon: this.icon('M12 3v12M7 8l5-5 5 5M5 21h14'),
    },
    {
      title: 'Draw or generate a signature',
      desc: 'Sign by hand on any screen, or pick one of four typed signature styles.',
      icon: this.icon('M4 20l4-1 11-11-3-3L5 16l-1 4z'),
    },
    {
      title: 'Spouse identity verification',
      desc: 'Joint filers invite a spouse who must pass KBA questions before they can sign.',
      icon: this.icon('M12 15a4 4 0 100-8 4 4 0 000 8zM4 20c1.5-3.5 4.7-5 8-5s6.5 1.5 8 5'),
    },
    {
      title: 'Real-time status',
      desc: 'Track every envelope from draft to completed, with clear errors if something needs attention.',
      icon: this.icon('M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z'),
    },
    {
      title: 'Signed document vault',
      desc: 'Download your completed, signed return in one place, stored for your records.',
      icon: this.icon('M12 3v18M5 8l7-5 7 5M5 21h14'),
    },
    {
      title: 'Full audit trail',
      desc: 'Every action — upload, sign, verify, submit — is logged with a timestamp and IP.',
      icon: this.icon('M9 12l2 2 4-4M21 12c0 5-3.5 8.5-9 10-5.5-1.5-9-5-9-10V6l9-4 9 4v6z'),
    },
  ];

  readonly steps: WorkflowStep[] = [
    {
      num: 1,
      title: 'Log in and get an envelope ID',
      desc: 'Choose "Complete in remote" on your dashboard and a unique envelope is created for your return.',
      tag: 'Account',
    },
    {
      num: 2,
      title: 'Upload your tax documents',
      desc: 'Add your W-2s, 1099s, ID, and any supporting paperwork straight into your envelope.',
      tag: 'Documents',
    },
    {
      num: 3,
      title: 'Sign as the primary filer',
      desc: 'Draw your signature or generate one from your typed name, then submit.',
      tag: 'Signature',
    },
    {
      num: 4,
      title: 'Spouse verifies and signs',
      desc: 'For joint returns, your spouse gets an email invite, passes identity verification, and adds their signature.',
      tag: 'Joint filing',
    },
    {
      num: 5,
      title: 'Submitted and stored',
      desc: 'Your envelope is marked complete, the signed return is saved, and you can download it anytime.',
      tag: 'Done',
    },
  ];

  private icon(path: string): SafeHtml {
    const svg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5"><path d="${path}"/></svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isProfileOpen) return;
    const target = event.target as HTMLElement;
    if (!this.host.nativeElement.contains(target) || target.closest('button') === null) {
      // Close the dropdown on any click outside the profile trigger/panel.
      const clickedInsideProfile = target.closest('[data-profile-root]');
      if (!clickedInsideProfile) {
        this.isProfileOpen = false;
      }
    }
  }

  toggleProfile(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isProfileOpen = !this.isProfileOpen;
  }

  startJourney(event: Event): void {
    event.preventDefault();
    this.isProfileOpen = false;
    this.router.navigateByUrl('/login');
  }

  goToSignup(event: Event): void {
    event.preventDefault();
    this.isProfileOpen = false;
    this.router.navigateByUrl('/signup');
  }

  ngAfterViewInit(): void {
    const revealEls = this.host.nativeElement.querySelectorAll<HTMLElement>(
      '.reveal, .reveal-stagger'
    );

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => this.observer?.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
