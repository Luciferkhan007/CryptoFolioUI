import { Injectable, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PromptModalComponent } from '../Components/prompt-modal/prompt-modal';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private modalService = inject(NgbModal);
  private toastr = inject(ToastrService);

  // Replace alert with toastr
  alert(message: string) {
    this.toastr.info(message);
  }

  // Replace prompt with modal
  async prompt(message: string, defaultValue: string = ''): Promise<string | null> {
    const modalRef = this.modalService.open(PromptModalComponent);
    modalRef.componentInstance.title = 'Input Required';
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.placeholder = defaultValue;
    modalRef.componentInstance.inputValue = defaultValue;

    try {
      const result = await modalRef.result;
      return result;
    } catch {
      return null; // dismissed
    }
  }
}