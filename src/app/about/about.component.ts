import {Component, OnInit} from '@angular/core';
import {of} from 'rxjs';

import {AngularFirestore} from '@angular/fire/firestore';
import {Course} from '../model/course';
// @angular/fire - official Firebase lib, that uses FB SDK under the hood
// It uses Observables instead of promises


// Nested Collections vs Parent one:
// If nested Collection can be a part of only 1 document - then nested
// e.g.: lessons can't belong to different courses, only to 1
// If lessons would belong to different Courses, then we had to transform it to Parent (1-st level) collection

// ID is fully unique and can be generated on client side without even internet connection (no collision with sequencial IDs)
// SQL ID has to be sequential, but Firebase - in async and hence fast

@Component({
    selector: 'about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

    constructor(private db: AngularFirestore) {
        // like websocket - for both below: if data changes on BE - it will be immediately reflected on FE
        // difference from FirestoreSDK promise - is live connection with BE
        // If data in DB changes - then UI part will be updated automatically
        // Observable listens all the time and not completes after value received

        // will return array of courses instances data, without their IDs (like .data() f())
        this.db.collection('courses').valueChanges().subscribe(console.log);

        // snapshotChanges - gives the state of whole collection (it has documents ID, not only their data)
        // it returns array of items each: {type: "added", payload: {…}}
        // payload has property 'doc' with its data and also ID
        this.db.collection('courses').snapshotChanges().subscribe(console.log);

        // stateChanges - the first time if gives the whole collection, but after - only the array of changed items
        // with snapshotItems type "modified"
        this.db.collection('courses').stateChanges().subscribe(console.log);
    }

    ngOnInit() {
        const courseRef = this.db.doc('/courses/brqjTmTehvhiHYPYTPC7')
            .snapshotChanges()
            .subscribe(snap => {
                const course: any = snap.payload.data();
                console.log('relatedCourseRef: ', course.relatedCourseRef);
            });

        // document ref works the similar way as foreignKey in SQL DB
        // reference - good way to link 2 DB documents
        const ref = this.db.doc('courses/i7j08O9Ww4rG0Z8y8hJa')
            .snapshotChanges()
            .subscribe(doc => {
                console.log('ref', doc.payload.ref);
            });
    }

    bulkSave() {
        const ngrxCourseRef = this.db.doc('/courses/HW951DlPNqKeYUPSL13Y').ref;
        const serverlessAngularCourseRef = this.db.doc('/courses/RQIH4u3ROWG5meVg13Qh').ref;

        const batch = this.db.firestore.batch();

        batch.update(ngrxCourseRef, {titles: {description: 'NGRX'}});
        batch.update(serverlessAngularCourseRef, {titles: {description: 'SERVERLESS ANGULAR'}});

        const batch$ = of(batch.commit()); // converting promise to Observable
        batch$.subscribe();

        // batch limit - 500 operations at once
    }

    // we want to lock our unit for modification from outside, until we finish the transaction
    async runTransaction() {
        // always return variables from transaction f(), never modify them inside
        const newLessonsCounter = await this.db.firestore.runTransaction(async transaction => {
            console.log('Running transaction');
            const courseReference = this.db.doc('/courses/HW951DlPNqKeYUPSL13Y').ref;

            const snap = await transaction.get(courseReference);

            const course = <Course>snap.data();

            // lessonsCount++ is the postfix increment, thus, the increment is handled after the return. return ++lessonsCount is correct
            const lessonsCount = ++course.lessonsCount;
            transaction.update(courseReference, {lessonsCount});

            return lessonsCount;
        });

        console.log('New Lessons counter: ' + newLessonsCounter);
    }
}

// types of changes: added, modified, removed
