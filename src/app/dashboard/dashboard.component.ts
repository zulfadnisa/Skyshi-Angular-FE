import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../dashboard.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  data: any = [];
  isLoading = false;
  private subs: any;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    this.getData();
  }
  getData() {
    this.isLoading = true;
    this.subs = this.dashboardService.getData().subscribe(
      (resp: any) => {
        this.isLoading = false;
        this.data = resp?.length ? resp : [];
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }
  addActivity() {
    this.isLoading = true;
    this.subs = this.dashboardService.addActivity().subscribe(
      (resp: any) => {
        if (resp) {
          this.getData();
        }
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }
  deleteActivity(data: any) {
    const customSwal =
      '<div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" data-cy="modal-delete-icon" style="fill: #ed4c5c; width: 25%; height: 25%"><path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z"/></svg><h2 data-cy="modal-delete-title" style="font-weight: 500; font-size: 18px">Apakah anda yakin menghapus activity <span style="font-weight: 600">' +
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
          .deleteActivity(data?.id)
          .subscribe(
            (resp: any) => {
              this.isLoading = false;
              this.getData();
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
  viewDetail(item: any) {
    if (item?.id) {
      this.router.navigate(['/detail', item.id]);
    }
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
