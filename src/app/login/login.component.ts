import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import * as firebaseui from 'firebaseui';
import * as firebase from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    // ui property of type "firebaseui.auth.AuthUI"
    ui: firebaseui.auth.AuthUI;

    constructor(private angularFireAuth: AngularFireAuth,
                private router: Router,
                private ngZone: NgZone) {
    }

    ngOnInit() {
        const uiConfig = {
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            callbacks: {
                // good practice to bid callback f()s
                // is called when we successfully login user
                signInSuccessWithAuthResult: this.onLoginSuccessful.bind(this)
            }
        };

        // Initializing auth library
        this.ui = new firebaseui.auth.AuthUI(this.angularFireAuth.auth);
        this.ui.start('#firebase-auth-container', uiConfig); // css selector
    }

    ngOnDestroy() {
        this.ui.delete();
    }

    onLoginSuccessful(result) {
        console.log('Firebase ui result, that is passed from UIConfig callbacks');
        console.log(result);

        // onLoginSuccessful() callback is clicked outside change detection ngZone
        this.ngZone.run(() => this.router.navigateByUrl('/courses'));
    }
}
