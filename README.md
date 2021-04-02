Firestore rules:

rules_version = '2';
service cloud.firestore {
  
  // path - starts from the root of FB application
  // match has always to point ot document, but not to a collection
  // and it doesn't apply to nested collections
  // here, for example, we'll see courses details, but not its nested lessons
  
  match /databases/{database}/documents/courses/{curseId} {
    allow read;
    allow write: if false;
  }
  
  match /databases/{database}/documents {
    // This rule allows anyone with your database reference to view, edit,
    // and delete all data in your Firestore database. Expiration date is indicated
    match /{document=**} {
      allow read: if true;
      allow write: if request.time < timestamp.date(2021, 11, 18);
      // combined operations together:
      // allow read, write: if request.time < timestamp.date(2021, 11, 18);
    }
  }
}

Syntax examples:
allow read;
is the same as:
allow read: if true;

allow write: if false;
allow write: if courseId == "aaa";

allow read: if request.auth.uid != null;; // for only authenticated users

{database} in match section - is a path variable declared
to use path variable: $(..). e.g.: /databases/$(database)/documents
if at least 1 rule allows read/write, then other prohibited rules won't override it; order of rules is not important


REFACTORING:  
match /databases/{database}/documents/courses/0ESyIx17sC122efCYIHy {
    allow read;
    allow write: if false;
}
  
match /databases/{database}/documents/courses/{curseId} {
    allow read: if false;
    allow write: if false;
}
  
Is the same as:
match /databases/{database}/documents/courses/{curseId} {
     allow read: if false;
     allow write: if curseId == "0ESyIx17sC122efCYIHy";
}


Permissions:
READ consists of: get, list
WRITE: create, update, delete


Widlcards:
document=** - means to capture "all the rest of path"


Functions:
function isAuthenticated() {
    	return request.auth.uid != null;
}
allow read: if isAuthenticated();
