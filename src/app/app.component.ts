import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    isLoggedIn$: Observable<boolean>;
    pictureUrl$: Observable<string>;

    constructor(private angularFireAuth: AngularFireAuth) {
    }

    ngOnInit(): void {
        this.angularFireAuth.authState.subscribe(user => console.log(user));
        this.isLoggedIn$ = this.angularFireAuth.authState.pipe(map(user => !!user));
        this.pictureUrl$ = this.angularFireAuth.authState.pipe(map(user => user?.photoURL));
    }

    logout() {
        this.angularFireAuth.auth.signOut();
        this.isLoggedIn$ = of(false);
    }
}
