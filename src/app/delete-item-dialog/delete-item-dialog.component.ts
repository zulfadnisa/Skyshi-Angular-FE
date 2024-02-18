import { Component, Inject,  OnDestroy,  OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-delete-item-dialog',
  templateUrl: './delete-item-dialog.component.html',
  styleUrls: ['./delete-item-dialog.component.scss'],
})
export class DeleteItemDialogComponent implements OnInit,OnDestroy {
  isLoading = false;
  private subs:any

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeleteItemDialogComponent>,
    private dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {}
  deleteItem() {
    if (this.data?.from === 'activity' && this.data?.id) {
      this.isLoading = true;
      this.subs = this.dashboardService
        .deleteActivity(this.data?.id)
        .subscribe(
          (resp: any) => {
            this.dialogRef.close('deleted');
            this.isLoading = false;
          },
          (err) => {
            this.isLoading = false;
          }
        );
    } else if (this.data?.from === 'item' && this.data?.id) {
      this.isLoading = true;
      this.subs = this.dashboardService
        .deleteActivityItem(this.data?.id)
        .subscribe(
          (resp: any) => {
            this.dialogRef.close('deleted');
            this.isLoading = false;
          },
          (err) => {
            this.isLoading = false;
          }
        );
    }
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
