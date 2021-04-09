import * as functions from 'firebase-functions';
import * as express from 'express';
import {db} from './init';

const cors = require('cors');

const app = express();
app.use(cors({origin: true})); // we allow cors requests

// express req and resp Objects
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', {structuredData: true});
  // response.status(200).send('Hello from Firebase!');
  response.status(200).json({message: 'Hello from Firebase functions/lib/index.js express server!'});
});

app.get('/courses', async (req, res) => {
  const coursesSnaps = await db.collection('courses').get();

  const courses: any[] = [];
  coursesSnaps.forEach((courseSnap: any) => courses.push(courseSnap.data()));

  res.status(200).json({courses});
});

export const getCourses = functions.https.onRequest(app);

export {onAddLesson} from './lessons-counter';
export {onDeleteLesson} from './lessons-counter';

export {resizeThumbnail} from './image-upload';

// Every export is turned in FB cloud f()

// deploy only specific f(): firebase deploy --only functions:onAddLesson,functions:onDeleteLesson
