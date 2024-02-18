import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { DashboardService } from '../dashboard.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-delete-item-dialog',
  templateUrl: './delete-item-dialog.component.html',
  styleUrls: ['./delete-item-dialog.component.scss'],
})
export class DeleteItemDialogComponent implements OnInit, OnDestroy {
  isLoading = false;
  private subs = new SubSink();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeleteItemDialogComponent>,
    private dashboardService: DashboardService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}
  deleteItem() {
    if (this.data?.from === 'activity' && this.data?.id) {
      this.isLoading = true;
      this.subs.sink = this.dashboardService
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
      this.subs.sink = this.dashboardService
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
