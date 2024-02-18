import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';
import { DashboardService } from '../dashboard.service';
import { MatDialog } from '@angular/material/dialog';
import { AddItemDialogComponent } from '../add-item-dialog/add-item-dialog.component';
import { DeleteItemDialogComponent } from '../delete-item-dialog/delete-item-dialog.component';

@Component({
  selector: 'app-dashboard-detail',
  templateUrl: './dashboard-detail.component.html',
  styleUrls: ['./dashboard-detail.component.scss'],
})
export class DashboardDetailComponent implements OnInit, OnDestroy {
  isLoading = false;
  isEditMode = false;

  activityId: any;
  activityData: any;
  dataItems: any = [];
  typeSorted = null;
  listSort = [
    {
      name: 'Terbaru',
      value: 'terbaru',
      src: '../../assets/image/terbaru.png',
      datacy:'sort-latest'
    },
    {
      name: 'Terlama',
      value: 'terlama',
      src: '../../assets/image/terlama.png',
      datacy:'sort-oldest'
    },
    {
      name: 'A-Z',
      value: 'asc',
      src: '../../assets/image/sort-az.png',
      datacy:'sort-az'
    },
    {
      name: 'Z-A',
      value: 'desc',
      src: '../../assets/image/sort za.png',
      datacy:'sort-za'
    },
    {
      name: 'Belum Selesai',
      value: 'not-done',
      src: '../../assets/image/not-done.png',
      datacy:'sort-unfinished'
    },
  ];

  titleForm = new UntypedFormControl(null);

  @ViewChild('inputEl') inputEl: ElementRef;
  @ViewChild('textEl') textEl: ElementRef;
  @ViewChild('pencilEl') pencilEl: ElementRef;
  private subs = new SubSink();

  constructor(
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (
        (e?.target === this.textEl?.nativeElement ||
          e?.target === this.pencilEl?.nativeElement) &&
        !this.isEditMode
      ) {
        this.isEditMode = true;
      } else if (e?.target !== this.inputEl?.nativeElement && this.isEditMode) {
        this.isEditMode = false;
        this.updateActivity();
      }
    });
    this.activityId = this.route?.snapshot?.params['id'];
    if (this.activityId) {
      this.getOneActivity();
    }
  }
  getOneActivity() {
    this.isLoading = true;
    this.subs.sink = this.dashboardService
      .getOneData(this.activityId)
      .subscribe(
        (resp) => {
          this.activityData = resp;
          this.titleForm.patchValue(this.activityData?.title);
          const tempItems = this.activityData?.todo_items?.length
            ? this.activityData?.todo_items
            : [];
          this.dataItems = tempItems.map((item: any, index: any) => {
            return {
              ...item,
              done: item?.is_active === 0 ? true : false,
              index,
            };
          });
          if (this.typeSorted) {
            this.sortData(this.typeSorted);
          }
          this.isLoading = false;
        },
        (err) => {
          this.isLoading = false;
        }
      );
  }
  updateActivity() {
    if (this.activityId && this.activityData?.title !== this.titleForm?.value) {
      const newData = {
        id: this.activityId,
        title: this.titleForm?.value,
      };
      this.isLoading = true;
      this.subs.sink = this.dashboardService.updateActivity(newData).subscribe(
        (resp) => {
          this.isLoading = false;
          this.typeSorted = null;
          this.getOneActivity();
        },
        (err) => {
          this.isLoading = false;
        }
      );
    }
  }
  addItem(from: string, item?: any) {
    this.subs.sink = this.dialog
      .open(AddItemDialogComponent, {
        disableClose: true,
        data: { activityId: this.activityId, from, ...item },
        autoFocus: false,
        width: '800px',
        height: '380px',
        panelClass: 'no-padding-pop-up',
      })
      .afterClosed()
      .subscribe((result: any) => {
        if (result) {
          this.getOneActivity();
          this.typeSorted = null;
        }
      });
  }
  deleteItem(data: any) {
    this.subs.sink = this.dialog
      .open(DeleteItemDialogComponent, {
        disableClose: true,
        data: { ...data, from: 'item' },
        autoFocus: false,
        width: '420px',
        height: '300px',
      })
      .afterClosed()
      .subscribe((result: any) => {
        console.log(`Dialog result: ${result}`);
        if (result === 'deleted') {
          this.getOneActivity();
        }
      });
  }
  updateStatus(item: any) {
    const currStatus = item?.done === true ? 0 : 1;
    const prevStatus = this.activityData?.todo_items?.find(
      (prev: any) => prev?.id === item?.id
    );

    if (prevStatus?.is_active !== currStatus) {
      this.isLoading = true;
      const updateItem = { ...item, is_active: currStatus };
      delete updateItem['done'];
      this.subs.sink = this.dashboardService
        .updateActivityItem(item?.id, updateItem)
        .subscribe(
          (resp: any) => {
            this.getOneActivity();
          },
          (err) => {
            this.isLoading = false;
          }
        );
    }
  }
  backToHome() {
    this.router.navigate(['/']);
  }
  sortData(type: any) {
    this.typeSorted = type ? type : null;
    const tempData = this.dataItems;
    if (type === 'asc') {
      this.dataItems = tempData.sort((a: any, b: any) =>
        a?.title?.toLowerCase().trim() < b?.title?.toLowerCase().trim()
          ? -1
          : a?.title?.toLowerCase().trim() > b?.title?.toLowerCase().trim()
          ? 1
          : 0
      );
    } else if (type === 'desc') {
      this.dataItems = tempData.sort((a: any, b: any) =>
        a?.title?.toLowerCase()?.trim() < b?.title?.toLowerCase().trim()
          ? 1
          : a?.title?.toLowerCase() > b?.title?.toLowerCase()?.trim()
          ? -1
          : 0
      );
    } else if (type === 'not-done') {
      this.dataItems = tempData.sort((a: any) => (!a?.done ? -1 : 1));
    } else if (type === 'terbaru') {
      this.dataItems = tempData.sort((a: any, b: any) =>
        a?.index < b?.index ? -1 : a?.index > b?.index ? 1 : 0
      );
    } else if (type === 'terlama') {
      this.dataItems = tempData.sort((a: any, b: any) =>
        a?.index > b?.index ? -1 : a?.index < b?.index ? 1 : 0
      );
    }
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
