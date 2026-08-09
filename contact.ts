import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface ContactFormModel {
  name: string;
  email: string;
  envelopeId: string;
  topic: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  encapsulation: ViewEncapsulation.None,
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  readonly topics: string[] = [
    'Uploading documents',
    'Signature not working',
    'Spouse verification (KBA)',
    'Envelope status / stuck submission',
    'Downloading signed documents',
    'Something else',
  ];

  model: ContactFormModel = {
    name: '',
    email: '',
    envelopeId: '',
    topic: '',
    message: '',
  };

  isSubmitting = false;
  submitted = false;

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      return;
    }

    this.isSubmitting = true;

    // Replace this with a real call to your ASP.NET Core API, e.g.:
    // this.http.post('/api/contact', this.model).subscribe({
    //   next: () => { this.isSubmitting = false; this.submitted = true; },
    //   error: () => { this.isSubmitting = false; /* show an error state */ }
    // });
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitted = true;
    }, 900);
  }

  resetForm(): void {
    this.model = { name: '', email: '', envelopeId: '', topic: '', message: '' };
    this.submitted = false;
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
