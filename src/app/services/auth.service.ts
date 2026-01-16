import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /*user$ = new BehaviorSubject<User | null>({
    uid: 'string',
    username: 'string',
    discriminator: 'string',
    permissions: 2,
    avatar: 'string',
    locale: 'string'
  });*/
  user$ = new BehaviorSubject<User | null>(null);
  constructor(private httpClient: HttpClient) {
  }

  checkLoggedIn(): Promise<boolean> {
    return new Promise<boolean>(
      (resolve: (result: boolean) => void) => {
        if (!localStorage.getItem('token')) {
          resolve(false);
          return;
        }
        this.httpClient.get<User>('/api/user')
          .subscribe(user => {
              if (user) {
                this.user$.next(user);
                resolve(true);
              } else {
                this.user$.next(null);
                localStorage.removeItem('token');
                resolve(false);
              }
            },
            () => {
              this.user$.next(null);
              localStorage.removeItem('token');
              resolve(false);
            });
      });
  }

  login(token: string): void {
    localStorage.setItem('token', token);
  }

  logout(): void {
    this.user$.next(null);
    localStorage.removeItem('token');
  }
}
