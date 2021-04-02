import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {Course} from '../model/course';
import {CoursesService} from '../services/courses.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    courses$: Observable<Course[]>;
    beginnerCourses$: Observable<Course[]>;
    advancedCourses$: Observable<Course[]>;

    constructor(private coursesService: CoursesService) {
    }

    ngOnInit() {
        this.reloadCourses();
    }

    reloadCourses() {
        // snapshotChanges - gives the state of whole collection, with items both: ID and data
        this.courses$ = this.coursesService.loadAllCourses();

        this.beginnerCourses$ = this.courses$.pipe(
            // courses - an array, not separate item
            map(courses => courses.filter(course => course.categories.includes('BEGINNER')))
        );

        this.advancedCourses$ = this.courses$.pipe(
            // courses - an array, not separate item
            map(courses => courses.filter(course => course.categories.includes('ADVANCED')))
        );
    }
}
