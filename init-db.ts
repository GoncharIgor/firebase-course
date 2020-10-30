import * as firebase from 'firebase';

import {COURSES, findLessonsForCourse} from './db-data';

const config = {
  apiKey: 'AIzaSyBhtIt8QfmWo9hmE3J2rF7kmpOxDrnz-yQ',
  authDomain: 'courses-9a24a.firebaseapp.com',
  databaseURL: 'https://courses-9a24a.firebaseio.com',
  projectId: 'courses-9a24a',
  storageBucket: 'courses-9a24a.appspot.com',
  messagingSenderId: '135606883791',
  appId: '1:135606883791:web:0243ac02cc150f999beeba',
  measurementId: 'G-ED02FD5KRE'
};

console.log('Uploading data to the database with the following config:\n');

console.log(JSON.stringify(config));

console.log('\n\n\n\nMake sure that this is your own database, so that you have write access to it.\n\n\n');

const app = firebase.initializeApp(config);
const db = firebase.firestore();

main().then(r => console.log('Done.'));

async function uploadData() {
  const courses = await db.collection('courses');

  for (const course of Object.values(COURSES)) {
    const newCourse = removeId(course);
    const courseRef = await courses.add(newCourse);

    const lessons = await courseRef.collection('lessons');
    const courseLessons = findLessonsForCourse(course['id']);
    console.log(`Uploading course ${course['titles']['description']}`);
    for (const lesson of courseLessons) {
      const newLesson = removeId(lesson);
      await lessons.add(newLesson);
    }
  }
}

function removeId(data: any) {
  const newData: any = {...data};
  delete newData.id;
  return newData;
}

async function main() {
  try {
    console.log('Start main...\n\n');
    await uploadData();
    console.log('\n\nClosing Application...');
    await app.delete();
  } catch (e) {
    console.log('Data upload failed, reason:', e, '\n\n');
  }
}

