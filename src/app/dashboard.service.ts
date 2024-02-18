import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}
  getData() {
    return this.http
      .get(
        'https://todo.api.devcode.gethired.id/activity-groups?email=zulfadzanisa@gmail.com'
      )
      .pipe(
        map((resp: any) => {
          return resp?.data ? resp['data'] : [];
        }),
        catchError((errorRes) => {
          alert(errorRes?.error?.message);
          return throwError(errorRes);
        })
      );
  }
  getOneData(id: Number) {
    return this.http
      .get(`https://todo.api.devcode.gethired.id/activity-groups/${id}`)
      .pipe(
        map((resp: any) => {
          return resp;
        }),
        catchError((errorRes) => {
          alert(errorRes?.error?.message);
          return throwError(errorRes);
        })
      );
  }
  addActivity() {
    const postData = { email: 'zulfadzanisa@gmail.com', title: 'new activity' };
    return this.http
      .post('https://todo.api.devcode.gethired.id/activity-groups', postData)
      .pipe(
        map((resp: any) => {
          return resp;
        }),
        catchError((errorRes) => {
          alert(errorRes?.error?.message);
          return throwError(errorRes);
        })
      );
  }
  updateActivity(data: any) {
    const postData = { title: data?.title };
    return this.http
      .patch(
        `https://todo.api.devcode.gethired.id/activity-groups/${data?.id}`,
        postData
      )
      .pipe(
        map((resp: any) => {
          return resp;
        }),
        catchError((errorRes) => {
          alert(errorRes?.error?.message);
          return throwError(errorRes);
        })
      );
  }
  deleteActivity(id: any) {
    return this.http
      .delete(`https://todo.api.devcode.gethired.id/activity-groups/${id}`)
      .pipe(
        map((resp: any) => {
          return resp;
        }),
        catchError((errorRes) => {
          alert(errorRes?.error?.message);
          return throwError(errorRes);
        })
      );
  }
  addActivityItem(newData: any) {
    const postData = { email: 'zulfadzanisa@gmail.com', ...newData };
    return this.http
      .post('https://todo.api.devcode.gethired.id/todo-items', postData)
      .pipe(
        map((resp: any) => {
          return resp;
        }),
        catchError((errorRes) => {
          alert(errorRes?.error?.message);
          return throwError(errorRes);
        })
      );
  }
  updateActivityItem(id: any, updateData: any) {
    const postData = { email: 'zulfadzanisa@gmail.com', ...updateData };
    return this.http
      .patch(`https://todo.api.devcode.gethired.id/todo-items/${id}`, postData)
      .pipe(
        map((resp: any) => {
          return resp;
        }),
        catchError((errorRes) => {
          alert(errorRes?.error?.message);
          return throwError(errorRes);
        })
      );
  }
  deleteActivityItem(id: any) {
    return this.http
      .delete(`https://todo.api.devcode.gethired.id/todo-items/${id}`)
      .pipe(
        map((resp: any) => {
          return resp;
        }),
        catchError((errorRes) => {
          alert(errorRes?.error?.message);
          return throwError(errorRes);
        })
      );
  }
}
