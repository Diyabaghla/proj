import {
  Component,
  ElementRef,
  HostListener,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Taxpayer {
  id: number;
  name: string;
  email: string;
}

export interface UploadedDocument {
  id: number;
  fileName: string;
  documentName: string;
  sizeLabel: string;
}

export type FieldType = 'Sign' | 'Date';

export interface DocumentField {
  id: number;
  groupNo: number;
  documentId: number;
  fieldName: FieldType;
  pageHeight: number;
  pageWidth: number;
  userId: number;
  top: number;
  left: number;
  width: number;
  height: number;
  pageNo: number;
  isFilled: boolean;
  signOrder: number;
}

export type RequestStatus =
  | 'Draft'
  | 'Documents uploaded'
  | 'Fields configured'
  | 'Sent to taxpayer'
  | 'Completed';

export interface TaxRequest {
  id: number;
  taxpayer: Taxpayer;
  status: RequestStatus;
  createdAt: Date;
  documents: UploadedDocument[];
  fields: DocumentField[];
}

interface UploadSlot {
  slotId: number;
  file: File | null;
  fileName: string;
  documentName: string;
  sizeLabel: string;
  isDragOver: boolean;
}

@Component({
  selector: 'app-taxpro-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './taxpro-dashboard.html',
  styleUrl: './taxpro-dashboard.css',
  encapsulation: ViewEncapsulation.None,
})
export class TaxproDashboardComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  // ---------------- Mock taxpayer directory (replace with an API call) ----------------
  readonly taxpayers: Taxpayer[] = [
    { id: 1, name: 'Sarah Whitfield', email: 'sarah.whitfield@mail.com' },
    { id: 2, name: 'Daniel Reyes', email: 'daniel.reyes@mail.com' },
    { id: 3, name: 'Meera Patel', email: 'meera.patel@mail.com' },
    { id: 4, name: 'Owen Castillo', email: 'owen.castillo@mail.com' },
    { id: 5, name: 'Priya Nair', email: 'priya.nair@mail.com' },
    { id: 6, name: 'James Okafor', email: 'james.okafor@mail.com' },
    { id: 7, name: 'Laura Bianchi', email: 'laura.bianchi@mail.com' },
    { id: 8, name: 'Tomás Herrera', email: 'tomas.herrera@mail.com' },
  ];

  // ---------------- Profile dropdown (top right) ----------------
  isProfileOpen = false;

  toggleProfile(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isProfileOpen = !this.isProfileOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isProfileOpen) return;
    const target = event.target as HTMLElement;
    if (!target.closest('[data-profile-root]')) {
      this.isProfileOpen = false;
    }
  }

  // ---------------- Taxpayer search / autocomplete ----------------
  searchQuery = '';
  filteredTaxpayers: Taxpayer[] = [];
  showDropdown = false;
  selectedTaxpayer: Taxpayer | null = null;

  onSearchInput(): void {
    this.selectedTaxpayer = null;
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredTaxpayers = [];
      this.showDropdown = false;
      return;
    }
    this.filteredTaxpayers = this.taxpayers.filter(
      (t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
    );
    this.showDropdown = true;
  }

  selectTaxpayer(t: Taxpayer): void {
    this.selectedTaxpayer = t;
    this.searchQuery = t.name;
    this.showDropdown = false;
  }

  clearSelection(): void {
    this.selectedTaxpayer = null;
    this.searchQuery = '';
    this.filteredTaxpayers = [];
    this.showDropdown = false;
  }

  // ---------------- Upload documents modal ----------------
  showUploadModal = false;
  uploadSlots: UploadSlot[] = [];
  private slotCounter = 0;
  /** true while re-opening the upload modal from inside the field modal (append mode) */
  private appendingToActiveRequest = false;

  openCreateRequest(): void {
    if (!this.selectedTaxpayer) return;
    this.appendingToActiveRequest = false;
    this.uploadSlots = [];
    this.addUploadSlot();
    this.showUploadModal = true;
  }

  addUploadSlot(): void {
    this.slotCounter += 1;
    this.uploadSlots.push({
      slotId: this.slotCounter,
      file: null,
      fileName: '',
      documentName: '',
      sizeLabel: '',
      isDragOver: false,
    });
  }

  removeUploadSlot(slotId: number): void {
    this.uploadSlots = this.uploadSlots.filter((s) => s.slotId !== slotId);
    if (this.uploadSlots.length === 0) this.addUploadSlot();
  }

  onDragOver(event: DragEvent, slot: UploadSlot): void {
    event.preventDefault();
    slot.isDragOver = true;
  }

  onDragLeave(slot: UploadSlot): void {
    slot.isDragOver = false;
  }

  onDrop(event: DragEvent, slot: UploadSlot): void {
    event.preventDefault();
    slot.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.attachFile(slot, file);
  }

  onBrowse(event: Event, slot: UploadSlot): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.attachFile(slot, file);
    input.value = '';
  }

  private attachFile(slot: UploadSlot, file: File): void {
    slot.file = file;
    slot.fileName = file.name;
    slot.documentName = slot.documentName || file.name.replace(/\.[^/.]+$/, '');
    slot.sizeLabel = this.formatSize(file.size);
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  get hasAtLeastOneDocument(): boolean {
    return this.uploadSlots.some((s) => !!s.file);
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
  }

  private nextRequestId = 1001;
  private nextDocId = 1;

  sendRequest(): void {
    if (!this.hasAtLeastOneDocument) return;

    const newDocs: UploadedDocument[] = this.uploadSlots
      .filter((s) => !!s.file)
      .map((s) => ({
        id: this.nextDocId++,
        fileName: s.fileName,
        documentName: s.documentName || s.fileName,
        sizeLabel: s.sizeLabel,
      }));

    if (this.appendingToActiveRequest && this.activeRequest) {
      this.activeRequest.documents.push(...newDocs);
    } else if (this.selectedTaxpayer) {
      const request: TaxRequest = {
        id: this.nextRequestId++,
        taxpayer: this.selectedTaxpayer,
        status: 'Documents uploaded',
        createdAt: new Date(),
        documents: newDocs,
        fields: [],
      };
      this.requests.unshift(request);
      this.activeRequest = request;
    }

    this.showUploadModal = false;
    this.uploadSlots = [];
  }

  /** Triggered from inside the "Add field" modal */
  addAnotherDocument(): void {
    this.showFieldModal = false;
    this.appendingToActiveRequest = true;
    this.uploadSlots = [];
    this.addUploadSlot();
    this.showUploadModal = true;
  }

  // ---------------- Requests / active request ----------------
  requests: TaxRequest[] = [];
  activeRequest: TaxRequest | null = null;

  viewRequest(r: TaxRequest): void {
    this.activeRequest = r;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fieldsForDoc(doc: UploadedDocument): DocumentField[] {
    if (!this.activeRequest) return [];
    return this.activeRequest.fields.filter((f) => f.documentId === doc.id);
  }

  statusClasses(status: RequestStatus): string {
    switch (status) {
      case 'Draft':
        return 'bg-[#ECEAE3] text-[#5B655F]';
      case 'Documents uploaded':
        return 'bg-[#E4EEE9] text-[#2F5D53]';
      case 'Fields configured':
        return 'bg-[#EFE3D2] text-[#8A5A2A]';
      case 'Sent to taxpayer':
        return 'bg-[#DCE7F2] text-[#2A5788]';
      case 'Completed':
        return 'bg-[#1D3D36] text-[#FBFAF7]';
      default:
        return 'bg-[#ECEAE3] text-[#5B655F]';
    }
  }

  // ---------------- Add field modal ----------------
  showFieldModal = false;
  private nextFieldId = 1;
  fieldForm: DocumentField = this.blankField();

  private blankField(): DocumentField {
    return {
      id: 0,
      groupNo: 1,
      documentId: 0,
      fieldName: 'Sign',
      pageHeight: 792,
      pageWidth: 612,
      userId: 0,
      top: 100,
      left: 100,
      width: 160,
      height: 48,
      pageNo: 1,
      isFilled: false,
      signOrder: 1,
    };
  }

  openAddField(doc: UploadedDocument): void {
    if (!this.activeRequest) return;
    this.fieldForm = this.blankField();
    this.fieldForm.id = this.nextFieldId;
    this.fieldForm.documentId = doc.id;
    this.fieldForm.userId = this.activeRequest.taxpayer.id;
    this.fieldForm.signOrder = this.activeRequest.fields.length + 1;
    this.showFieldModal = true;
  }

  closeFieldModal(): void {
    this.showFieldModal = false;
  }

  submitField(): void {
    if (!this.activeRequest) return;
    this.activeRequest.fields.push({ ...this.fieldForm, id: this.nextFieldId });
    this.nextFieldId += 1;
    if (this.activeRequest.status === 'Documents uploaded') {
      this.activeRequest.status = 'Fields configured';
    }
    this.showFieldModal = false;
  }

  markSentToTaxpayer(): void {
    if (!this.activeRequest) return;
    this.activeRequest.status = 'Sent to taxpayer';
  }
}
