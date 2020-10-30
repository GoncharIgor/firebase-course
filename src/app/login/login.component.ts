import { Component, OnInit } from '@angular/core';
import * as firebaseui from 'firebaseui';
import * as firebase from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  ui: firebaseui.auth.AuthUI;

  constructor(private angularFireAuth: AngularFireAuth) { }

  ngOnInit() {
    const uiConfig = {
      signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        // good practice to bid callback f()s
        signInSuccessWithAuthResult: this.onLoginSuccessful.bind(this)
      }
    };

    this.ui = new firebaseui.auth.AuthUI(this.angularFireAuth.auth);
    this.ui.start('#firebase-auth-container', uiConfig); // css selector
  }

  onLoginSuccessful() {

  }

}
