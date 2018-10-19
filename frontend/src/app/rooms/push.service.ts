import { Injectable, Inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

export const STORAGE_KEY = 'ct_push_auth_token';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  readonly VAPID_PUBLIC_KEY = 'BBkrn3qBt1du3SVflJ2bTGYC7BiKZ8-dN2S2RK0PuaeZkgAKiFxJ-lT0BEMIoIRymFtkt4UY5Jz6S6JPJ1dm5mo';

  constructor(
    private swPush: SwPush,
    @Inject(LOCAL_STORAGE) private storage: StorageService,
    private http: HttpClient,
  ) { }

  getAuthToken(): Promise<string> {
    const auth_token = this.storage.get(STORAGE_KEY);
    return auth_token ? Promise.resolve(auth_token) : this.createSubscription();
  }

  deleteSubscription(): void {
    this.getAuthToken()
      .then(auth_token => {
        this.http.delete('/api/push', {
          headers: new HttpHeaders({ auth: auth_token })
        }).subscribe();
      });
  }

  private createSubscription(): Promise<string | void> {
    return this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      })
      .then((sub: PushSubscription) => {
        const auth_token: string = sub.toJSON().keys['auth'];

        // create subscription at our backend
        this.http.post('/api/push', {
          endpoint: sub.endpoint,
          auth: auth_token,
          p256dh: sub.toJSON().keys['p256dh']
        }).subscribe();

        this.storage.set(STORAGE_KEY, auth_token);
        return auth_token;
      })
      .catch((err) => {
        console.error('Could not subscribe to push notifications', err);
      });
  }
}
