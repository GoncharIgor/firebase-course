import * as functions from 'firebase-functions';
import {db} from './init';

export const onAddLesson = functions.firestore.document('courses/{courseId}/lessons/{lessonId}')
    // context - allows to retrieve the value of path vars
    .onCreate(async (documentSnapshot, context) => {
        // const courseId = context.params.courseId;

        console.log('Running onAddLesson trigger');

        // a cb anonymous f(), that accepts 1 arg. We expect this arg to be a "course", while being triggered
        courseTransaction(documentSnapshot, course => {
            return {lessonsCount: course.lessonsCount + 1};
        });
    });

export const onDeleteLesson = functions.firestore.document('courses/{courseId}/lessons/{lessonId}')
    .onDelete(async (documentSnapshot, context) => {

        console.log('Running oDeleteLesson trigger');

        // a cb anonymous f(), that accepts 1 arg. We expect this arg to be a "course", while being triggered
        courseTransaction(documentSnapshot, course => {
            return {lessonsCount: course.lessonsCount - 1};
        });
    });

// inside courseTransaction() f(), we don't know what cb f() does
// we just trigger it, only knowing it's argument and returned type
function courseTransaction(lessonDocSnapshot, cb: Function) {
    return db.runTransaction(async (transaction) => {
        const courseRef = lessonDocSnapshot.ref.parent.parent; // ref to parent course of lesson

        const courseSnap = await transaction.get(courseRef); // transaction gets not path to Doc, but document reference

        const course = courseSnap.data();
        const changes = cb(course);

        transaction.update(courseRef, changes);
    });
}
