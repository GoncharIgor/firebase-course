import {Component, OnInit} from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {Course} from '../model/course';

const firebaseConfig = {
    apiKey: 'AIzaSyBhtIt8QfmWo9hmE3J2rF7kmpOxDrnz-yQ',
    authDomain: 'courses-9a24a.firebaseapp.com',
    databaseURL: 'https://courses-9a24a.firebaseio.com',
    projectId: 'courses-9a24a',
    storageBucket: 'courses-9a24a.appspot.com',
    messagingSenderId: '135606883791',
    appId: '1:135606883791:web:0243ac02cc150f999beeba',
    measurementId: 'G-ED02FD5KRE'
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


export class AboutComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
        // Query single doc
        db.doc('courses/HW951DlPNqKeYUPSL13Y').get()
            // in documentSnapshot.data() - we don't have item ID. It's present in parent documentSnapshot
            // other useful f()s of parent: exists, metadata
            // documentSnapshot.id
            .then(documentSnapshot => console.log(documentSnapshot.data()));

        // Query whole collection items, manually combining data with its id
        db.collection('courses').get()
            .then(snaps => {
                const courses: Course[] = snaps.docs.map(itemSnapshot => {
                    return <Course>{
                        id: itemSnapshot.id,
                        ...itemSnapshot.data()
                    };
                });

                console.log(courses);
            });
    }
}
