import { Injectable, Inject } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const STORAGE_KEY = 'ct_push_auth_token';

@Injectable({
    providedIn: 'root'
})
export class PushService {
    readonly VAPID_PUBLIC_KEY = 'BBkrn3qBt1du3SVflJ2bTGYC7BiKZ8-dN2S2RK0PuaeZkgAKiFxJ-lT0BEMIoIRymFtkt4UY5Jz6S6JPJ1dm5mo';

    constructor(
        private swPush: SwPush,
        private swUpdate: SwUpdate,
        @Inject(LOCAL_STORAGE) private storage: StorageService,
        private http: HttpClient,
    ) { }

    isPushAvailable() {
        return this.swUpdate.isEnabled;
    }

    getAuthToken(): Promise<string> {
        const auth_token = this.storage.get(STORAGE_KEY);
        return auth_token ? Promise.resolve(auth_token) : this.createSubscription();
    }

    deleteSubscription(): Promise<any> {
        return this.getAuthToken()
            .then(auth_token => {
                return this.http.delete(environment.baseUrl + '/api/push', {
                    headers: new HttpHeaders({ auth: auth_token })
                }).toPromise();
            });
    }

    private createSubscription(): Promise<string | void> {
        if (!this.swUpdate.isEnabled) {
            return Promise.reject();
        }
        let auth_token: string;
        return this.swPush
            .requestSubscription({
                serverPublicKey: this.VAPID_PUBLIC_KEY
            })
            .then(sub => {
                auth_token = sub.toJSON().keys['auth'];
                // create subscription at our backend
                return this.http.post(environment.baseUrl + '/api/push', {
                    endpoint: sub.endpoint,
                    auth: auth_token,
                    p256dh: sub.toJSON().keys['p256dh']
                }).toPromise();
            })
            .then(() => {
                this.storage.set(STORAGE_KEY, auth_token);
                return auth_token;
            })
            .catch(err => {
                console.error('Could not subscribe to push notifications', err);
            });
    }
}
