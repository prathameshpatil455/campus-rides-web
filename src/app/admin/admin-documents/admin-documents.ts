import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth/auth.service';
import { useGetCurrentUser } from '../../services/user/get-current-user';
import { useGetPendingDocuments, PendingDocument } from '../../services/admin/get-pending-documents';
import { useVerifyDocument } from '../../services/admin/verify-document';
import { RejectDocumentDialog } from './reject-document-dialog';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-admin-documents',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    DatePipe,
    SidebarComponent,
  ],
  templateUrl: './admin-documents.html',
  styleUrl: './admin-documents.css',
})
export class AdminDocuments {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private router = inject(Router);

  userQuery = useGetCurrentUser();

  pendingDocumentsQuery = useGetPendingDocuments({ page: 1, limit: 20 });
  verifyDocumentMutation = useVerifyDocument();

  get pendingDocuments(): PendingDocument[] {
    return this.pendingDocumentsQuery.data() || [];
  }

  approveDocument(document: PendingDocument) {
    this.verifyDocumentMutation.mutate(
      {
        userId: document.userId,
        documentType: document.documentType,
        action: 'approve',
      },
      {
        onSuccess: () => {
          this.snackBar.open('Document approved successfully', 'Close', { duration: 3000 });
        },
        onError: (error) => {
          this.snackBar.open('Failed to approve document', 'Close', { duration: 3000 });
          console.error('Approve error:', error);
        },
      }
    );
  }

  rejectDocument(document: PendingDocument) {
    const dialogRef = this.dialog.open(RejectDocumentDialog, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (!reason) return;

      this.verifyDocumentMutation.mutate(
        {
          userId: document.userId,
          documentType: document.documentType,
          action: 'reject',
          reason: reason,
        },
        {
          onSuccess: () => {
            this.snackBar.open('Document rejected', 'Close', { duration: 3000 });
          },
          onError: (error) => {
            this.snackBar.open('Failed to reject document', 'Close', { duration: 3000 });
            console.error('Reject error:', error);
          },
        }
      );
    });
  }

  previewDocument(documentUrl: string) {
    window.open(documentUrl, '_blank');
  }

  getDocumentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      studentID: 'Student ID Card',
      license: "Driver's License",
      profilePhoto: 'Profile Photo',
    };
    return labels[type] || type;
  }

}
