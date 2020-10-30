import {Component, OnInit} from '@angular/core';
import 'firebase/firestore';
import {AngularFirestore} from '@angular/fire/firestore';
import {of} from 'rxjs';
import {Course} from '../model/course';


@Component({
    selector: 'about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

    constructor(private db: AngularFirestore) {
        // like websocket - for both below: if data changes on BE - it will be immediately reflected on FE
        // will return array of courses instances without their IDs (like .data() f())
        // difference from FirestoreSDK - is live connection with BE
        this.db.collection('courses').valueChanges().subscribe(console.log);

        // snapshotChanges - gives the state of whole collection
        this.db.collection('courses').snapshotChanges().subscribe(console.log);

        // stateChanges - the first time if gives the whole collection, but after - only the array of changed items
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
