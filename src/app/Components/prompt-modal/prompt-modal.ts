import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prompt-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ title }}</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <p>{{ message }}</p>
      <input type="text" class="form-control" [(ngModel)]="inputValue" placeholder="{{ placeholder }}" />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss('Cancel')">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="activeModal.close(inputValue)">OK</button>
    </div>
  `,
  styles: [`
    .modal-body p {
      margin-bottom: 1rem;
    }
  `]
})
export class PromptModalComponent {
  activeModal = inject(NgbActiveModal);
  title = '';
  message = '';
  placeholder = '';
  inputValue = '';
}