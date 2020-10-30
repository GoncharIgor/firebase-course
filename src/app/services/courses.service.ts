import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {first, map} from 'rxjs/operators';
import {Course} from '../model/course';
import {convertSnapshotsFromFS} from './db-utils';
import {from, Observable, of} from 'rxjs';
import {Lesson} from '../model/lesson';
import OrderByDirection = firebase.firestore.OrderByDirection;

@Injectable({
    providedIn: 'root'
})
export class CoursesService {

    constructor(private db: AngularFirestore) {
    }

    loadAllCourses() {
        return this.db.collection('courses', ref => ref
            .orderBy('seqNo'))
            // .where('categories', 'array-contains', 'BEGINNER'))
            // .where('seqNo', '==', 2)
            // .where('seqNo', '>', 0)
            // .where('seqNo', '<=', 5)
            // the same above as:  .startAfter(0).endAt(5)
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
        return from(this.db.doc(`courses/${courseId}`).update(changes));
    }
}
