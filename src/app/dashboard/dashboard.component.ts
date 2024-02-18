import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../dashboard.service';
import { SubSink } from 'subsink';
import { MatDialog } from '@angular/material/dialog';
import { DeleteItemDialogComponent } from '../delete-item-dialog/delete-item-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  data: any = [];
  isLoading = false;
  private subs: any = new SubSink();

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getData();
  }
  getData() {
    this.isLoading = true;
    this.subs.sink = this.dashboardService.getData().subscribe(
      (resp: any) => {
        this.data = resp?.length ? resp : [];
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }
  addActivity() {
    this.isLoading = true;
    this.subs.sink = this.dashboardService.addActivity().subscribe(
      (resp: any) => {
        if (resp) {
          this.isLoading = false
          this.getData();
        }
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }
  deleteActivity(data: any) {
    this.subs.sink = this.dialog
      .open(DeleteItemDialogComponent, {
        disableClose: true,
        data: { ...data, from: 'activity' },
        autoFocus: false,
        width: '420px',
        height: '300px',
      })
      .afterClosed()
      .subscribe((result: any) => {
        console.log(`Dialog result: ${result}`);
        if (result === 'deleted') {
          this.getData();
          const popUp = this.dialog.open(DeleteItemDialogComponent, {
            data: { from: 'deleted' },
            autoFocus: false,
            width: '400px',
            height: '80px',
          });
        }
      });
  }
  viewDetail(item: any) {
    if (item?.id) {
      this.router.navigate(['/detail', item.id]);
    }
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
