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
import { DashboardService } from '../dashboard.service';
import { MatDialog } from '@angular/material/dialog';
import { AddItemDialogComponent } from '../add-item-dialog/add-item-dialog.component';
import Swal from 'sweetalert2';
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
      datacy: 'sort-latest',
    },
    {
      name: 'Terlama',
      value: 'terlama',
      src: '../../assets/image/terlama.png',
      datacy: 'sort-oldest',
    },
    {
      name: 'A-Z',
      value: 'asc',
      src: '../../assets/image/sort-az.png',
      datacy: 'sort-az',
    },
    {
      name: 'Z-A',
      value: 'desc',
      src: '../../assets/image/sort za.png',
      datacy: 'sort-za',
    },
    {
      name: 'Belum Selesai',
      value: 'not-done',
      src: '../../assets/image/not-done.png',
      datacy: 'sort-unfinished',
    },
  ];

  titleForm = new UntypedFormControl(null);

  @ViewChild('inputEl') inputEl: ElementRef;
  @ViewChild('textEl') textEl: ElementRef;
  @ViewChild('pencilEl') pencilEl: ElementRef;
  private subs: any;

  constructor(
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.typeSorted = null;
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
    this.subs = this.dashboardService.getOneData(this.activityId).subscribe(
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
      this.subs = this.dashboardService.updateActivity(newData).subscribe(
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
    this.subs = this.dialog
      .open(AddItemDialogComponent, {
        disableClose: false,
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
    const customSwal =
      '<div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" data-cy="modal-delete-icon" style="fill: #ed4c5c; width: 25%; height: 25%"><path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z"/></svg><h2 data-cy="modal-delete-title" style="font-weight: 500; font-size: 18px">Apakah anda yakin menghapus item <span style="font-weight: 600">' +
      data?.title +
      '</span>?</h2></div>';
    Swal.fire({
      html: customSwal,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: true,
      showCloseButton: false,
      showCancelButton: true,
      focusConfirm: false,
      showConfirmButton: true,
      confirmButtonText:
        '<span data-cy="modal-delete-confirm-button">Hapus</span>',
      cancelButtonText:
        '<span data-cy="modal-delete-cancel-button">Batal</span>',
      didOpen: (modalEl) => {
        modalEl.setAttribute('data-cy', 'modal-delete');
      },
      customClass: {
        confirmButton: 'custom-confirm',
        cancelButton: 'custom-cancel',
      },
    }).then((confirm) => {
      if (confirm?.value) {
        this.isLoading = true;
        this.subs = this.dashboardService
          .deleteActivityItem(data?.id)
          .subscribe(
            (resp: any) => {
              this.isLoading = false;
              this.getOneActivity();
              const customSwal =
                '<div style="display:flex;align-items:center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-cy="modal-information-icon" style="fill: #00A790;width:24px;height:24px"><path d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" /></svg><h3 style="margin:0" data-cy="modal-information-title">Activity berhasil dihapus</h3></div>';
              Swal.fire({
                html: customSwal,
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: true,
                showCloseButton: false,
                showCancelButton: false,
                focusConfirm: false,
                showConfirmButton: false,
                didOpen: (modalEl) => {
                  modalEl.setAttribute('data-cy', 'modal-information');
                },
              });
            },
            (err) => {
              this.isLoading = false;
            }
          );
      }
    });
  }
  updateStatus(item: any) {
    const updateItem = {
      ...item,
      done : !item?.done ? true : false,
      is_active: !item?.done ? 0 : 1
    }
    const prevStatus = this.activityData?.todo_items?.find(
      (prev: any) => prev?.id === item?.id
    );
    if (prevStatus?.is_active !== updateItem?.is_active) {
      delete updateItem['done'];
      delete updateItem['index'];
      this.isLoading = true
      this.subs = this.dashboardService
        .updateItem(item?.id, updateItem)
        .subscribe((resp: any) => {
          this.getOneActivity();
        },err=>{
          this.isLoading = false
        });
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
