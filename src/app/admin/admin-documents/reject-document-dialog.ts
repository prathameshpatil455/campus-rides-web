import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-reject-document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Reject Document</h2>
    <mat-dialog-content>
      <p>Please provide a reason for rejecting this document:</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Rejection Reason</mat-label>
        <textarea
          matInput
          [(ngModel)]="reason"
          placeholder="Enter reason for rejection..."
          rows="4"
          required
        ></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onReject()" [disabled]="!reason.trim()">
        Reject
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        min-width: 400px;
        padding: 1rem 0;
      }

      p {
        margin-bottom: 1rem;
        color: #666;
      }

      .full-width {
        width: 100%;
      }

      mat-dialog-actions {
        padding: 1rem 1.5rem 1.5rem 0;
        gap: 0.5rem;
      }
    `,
  ],
})
export class RejectDocumentDialog {
  reason = '';
  dialogRef = inject(MatDialogRef<RejectDocumentDialog>);

  onCancel() {
    this.dialogRef.close();
  }

  onReject() {
    if (this.reason?.trim()) {
      this.dialogRef.close(this.reason.trim());
    }
  }
}
