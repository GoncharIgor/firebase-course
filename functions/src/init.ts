// eslint-disable
const admin = require('firebase-admin');

admin.initializeApp(); // Initialises FB DB connection

export const db = admin.firestore();
