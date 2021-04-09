import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Course} from '../model/course';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CoursesService} from '../services/courses.service';
import {AngularFireStorage} from '@angular/fire/storage';
import {Observable} from 'rxjs';
import {concatMap, last} from 'rxjs/operators';

@Component({
    selector: 'course-dialog',
    templateUrl: './course-dialog.component.html',
    styleUrls: ['./course-dialog.component.css']
})
export class CourseDialogComponent implements OnInit {
    form: FormGroup;
    description: string;
    course: Course;

    uploadPercent$: Observable<number>;
    downloadUrd$: Observable<string>;

    constructor(
        @Inject(MAT_DIALOG_DATA) course: Course,
        private coursesService: CoursesService,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CourseDialogComponent>,
        private storage: AngularFireStorage
    ) {
        const titles = course.titles;
        this.course = course;

        this.form = fb.group({
            description: [titles.description, Validators.required],
            longDescription: [titles.longDescription, Validators.required]
        });
    }

    ngOnInit() {
    }

    uploadFile(event) {
        const file: File = event.target.files[0];
        // root Firebase bucket where we create "courses" subfolder
        const destinationFilePath = `courses/${this.course.id}/${file.name}`;
        const uploadTask = this.storage.upload(destinationFilePath, file);

        this.uploadPercent$ = uploadTask.percentageChanges();


        this.downloadUrd$ = uploadTask.snapshotChanges()
            .pipe(
                last(), // will wait for observable to complete
                concatMap(() => this.storage.ref(destinationFilePath).getDownloadURL())
            );

        //TODO it may cotradict with FB function "image-upload". FB function has to be fixed and here it has to be cleared
        const saveUrl$ = this.downloadUrd$.pipe(
            concatMap(downloadUrd => this.coursesService.saveCourse(this.course.id, {uploadedImageUrl: downloadUrd}))
        ).subscribe();

        this.downloadUrd$.subscribe(console.log); // triggering the upload task
    }

    save() {
        const changes = this.form.value;
        this.coursesService.saveCourse(this.course.id, {titles: changes}).subscribe(
            () => {
                this.dialogRef.close(this.form.value);
            }
        );
    }

    close() {
        this.dialogRef.close();
    }

}






