import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { DashboardService } from '../dashboard.service';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-add-item-dialog',
  templateUrl: './add-item-dialog.component.html',
  styleUrls: ['./add-item-dialog.component.scss'],
})
export class AddItemDialogComponent implements OnInit, OnDestroy {
  isLoading = false;
  listPriority = [
    { value: 'very-high', label: 'Very High', color: 'red' },
    { value: 'high', label: 'High', color: 'yellow' },
    { value: 'normal', label: 'Medium', color: 'green' },
    { value: 'low', label: 'Low', color: 'blue' },
    { value: 'very-low', label: 'Very Low', color: 'purple' },
  ];
  filteredPriority: any[] = [];
  selectedPrio = null;
  form: UntypedFormGroup;
  private subs = new SubSink();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddItemDialogComponent>,
    private dashboardService: DashboardService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.searchPriority();
    this.filteredPriority = this.listPriority;
    if (this.data?.from === 'edit' && this.data?.activityId) {
      this.populateItem();
    }else{
      this.form?.get('priority')?.patchValue({ value: 'very-high', label: 'Very High', color: 'red' })
    }
  }
  initForm() {
    this.form = this.fb.group({
      title: [null, Validators.required],
      priority: [null, Validators.required],
    });
  }
  populateItem() {
    const currPriority = this.listPriority.find(
      (prio) => prio?.value === this.data?.priority
    );
    const currData = {
      title: this.data?.title,
      priority: currPriority ? currPriority : { value: 'very-high', label: 'Very High', color: 'red' },
    };
    this.form?.patchValue(currData,{emitEvent:false});
  }
  displayLabel(priority: any) {
    if (priority?.value) {
      const foundValue = this.listPriority.find(
        (prio) => prio?.value === priority?.value
      );
      return foundValue ? foundValue?.label : '';
    }
    return '';
  }
  searchPriority() {
    this.subs.sink = this.form
      .get('priority')
      ?.valueChanges.pipe(debounceTime(300))
      .subscribe((search: any) => {
        if (search?.trim()) {
          this.filteredPriority = this.listPriority.filter((prio) =>
            prio?.label
              .toLowerCase()
              .trim()
              .includes(search?.toLowerCase()?.trim())
          );
        } else {
          this.filteredPriority = this.listPriority;
        }
      });
  }
  selectedPriority(option: any) {
    this.form?.get('priority')?.patchValue(option, { emitEvent: false });
    this.selectedPrio = option?.value;
  }
  checkSelectedOption() {
    const formPrio = this.form?.get('priority')?.value;
    if (!formPrio?.value && this.selectedPrio) {
      const prevPrio = this.listPriority.find(
        (prio) => prio?.value === this.selectedPrio
      );
      if (prevPrio?.value) {
        this.form?.get('priority')?.patchValue(prevPrio, { emitEvent: false });
        this.filteredPriority = this.listPriority;
      }
    }
  }
  addItem() {
    if (this.form?.invalid) {
      this.form?.markAllAsTouched();
      return;
    }
    if (this.data?.activityId) {
      const payload = {
        activity_group_id: this.data?.activityId,
        title: this.form?.get('title')?.value,
        priority: this.form?.get('priority')?.value?.value
          ? this.form?.get('priority')?.value?.value
          : this.selectedPrio,
      };
      this.isLoading = true;

      if (this.data?.from === 'edit') {
        this.subs.sink = this.dashboardService
          .updateActivityItem(this.data?.id, payload)
          .subscribe(
            (resp: any) => {
              this.dialogRef.close('added');
              this.isLoading = false;
            },
            (err: any) => {
              this.isLoading = false;
            }
          );
      } else {
        this.subs.sink = this.dashboardService
          .addActivityItem(payload)
          .subscribe(
            (resp: any) => {
              this.dialogRef.close('added');
              this.isLoading = false;
            },
            (err: any) => {
              this.isLoading = false;
            }
          );
      }
    }
  }
  close() {
    this.dialogRef.close();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
