import {Injectable} from '@angular/core';
import {first, map} from 'rxjs/operators';
import {convertSnapshotsFromFS} from './db-utils';
import {from, Observable} from 'rxjs';

import {AngularFirestore} from '@angular/fire/firestore';

import {Lesson} from '../model/lesson';
import {Course} from '../model/course';
import OrderByDirection = firebase.firestore.OrderByDirection;

@Injectable({
    providedIn: 'root'
})
export class CoursesService {

    constructor(private db: AngularFirestore) {
    }

    // In terms of performance, the whole size of DB doesn't matter
    // Matters only the size of returned result

    // no possibility to make a compound index with 2 calculation types (>, <). One of them (FIRST) has to be a match (==)

    loadAllCourses() {
        return this.db.collection('courses', ref => ref
            .orderBy('seqNo'))
            // .where('categories', 'array-contains', 'BEGINNER'))
            // .where('seqNo', '==', 2)
            // .where('seqNo', '>', 0)
            // .where('seqNo', '<=', 5)
            // OR
            // the same above ('seqNo', '>', 0 && 'seqNo', '<=', 5)
            // is to use: .startAfter(0).endAt(5)
            .snapshotChanges()
            .pipe(
                map(snapshot => convertSnapshotsFromFS<Course>(snapshot)),
                // because firebase Observable is not like a standard http observable, that emits 1 value and completes,
                // the Firebase Observables are based on Web Sockets - they are not completed
                // it is implemented by Firebase SDK websocket, and angularFire uses Firebase SDK under the hood
                // first() - taking the first value and complete the observable, in order not to react like a websocket
                first()
            );
    }

    findCourseByUrl(courseUrl: string): Observable<Course> {
        return this.db.collection('courses', ref => ref.where('url', '==', courseUrl))
            .snapshotChanges()
            .pipe(
                map(snapshot => {
                    const courses = convertSnapshotsFromFS<Course>(snapshot);

                    return courses.length === 1 ? courses[0] : undefined;
                }),
                first()
            );
    }

    findLessons(courseId: string, sortOrder: OrderByDirection = 'asc', pageNumber = 0, pageSize = 3): Observable<Lesson[]> {
        return this.db.collection(`courses/${courseId}/lessons`,
            ref => ref.orderBy('seqNo', sortOrder)
                .limit(pageSize)
                .startAfter(pageNumber * pageSize))
            .snapshotChanges()
            .pipe(
                map(snaps => convertSnapshotsFromFS<Lesson>(snaps)),
                first()
            );
    }

    saveCourse(courseId: string, changes: Partial<Course>): Observable<any> {
        // update f() returns a promise. With 'from' we convert it to Observable
        // means: make Observable FROM Promise
        return from(this.db.doc(`courses/${courseId}`).update(changes));
    }
}
