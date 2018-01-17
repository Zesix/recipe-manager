import { Injectable } from "@angular/core";
import {
    AngularFirestore,
    AngularFirestoreDocument,
    AngularFirestoreCollection
  } from 'angularfire2/firestore';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/switchMap';
import { expand, takeWhile, tap, mergeMap, take } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';
import * as firebase from 'firebase/app';

type CollectionPredicate<T> = string | AngularFirestoreCollection<T>;
type DocPredicate<T>        = string | AngularFirestoreDocument<T>;

@Injectable()
export class FirestoreService {
    constructor (private angularFireStore: AngularFirestore) {}

  /// **************
  /// Get a Reference
  /// **************
  col<T>(ref: CollectionPredicate<T>, queryFn?): AngularFirestoreCollection<T> {
    return typeof ref === 'string' ? this.angularFireStore.collection<T>(ref, queryFn) : ref
  }

  doc<T>(ref: DocPredicate<T>): AngularFirestoreDocument<T> {
    return typeof ref === 'string' ? this.angularFireStore.doc<T>(ref) : ref
  }

  /// **************
  /// Get data from firestore as an Observable.
  /// **************
  /// Usage:
  /// this.db.doc$('notes/ID');
  /// this.db.col$('notes', ref => ref.where('user', '==', 'Jeff'));
  /// Or just like regular AngularFire:
  /// noteRef: AngularFireList = this.db.doc('notes/ID');
  /// this.db.doc(noteRef);
  /// this.noteRef.valueChanges();
  /// **************
  /// Get documents with IDs included:
  /// db.colWithIds$('notes');
  /// **************
  doc$<T>(ref:  DocPredicate<T>): Observable<T> {
    return this.doc(ref).snapshotChanges().map(doc => {
      return doc.payload.data() as T
    })
  }
  col$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<T[]> {
    return this.col(ref, queryFn).snapshotChanges().map(docs => {
      return docs.map(a => a.payload.doc.data()) as T[]
    });
  }
  /// with Ids
  colWithIds$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<any[]> {
    return this.col(ref, queryFn).snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data }
      });
    });
  }
  /// **************
  /// Write Data with a timestamp for easier ordering later.
  /// **************
  /// Usage:
  /// db.update('items/ID', data);                       // adds updatedAt field
  /// db.set('items/ID', data);                          // adds createdAt field
  /// db.add('items', data);                             // adds createdAt field
  /// this.db.upsert('notes/xyz', { content: 'hello' })  // updates doc or creates new if doesn't exist
  /// **************
  /// Retrieve firebase server timestamp.
  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp()
  }
  set<T>(ref: DocPredicate<T>, data: any) {
    const timestamp = this.timestamp
    return this.doc(ref).set({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    })
  }
  update<T>(ref: DocPredicate<T>, data: any) {
    return this.doc(ref).update({
      ...data,
      updatedAt: this.timestamp
    })
  }
  delete<T>(ref: DocPredicate<T>) {
    return this.doc(ref).delete()
  }
  add<T>(ref: CollectionPredicate<T>, data) {
    const timestamp = this.timestamp
    return this.col(ref).add({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    })
  }
  geopoint(lat: number, lng: number) {
    return new firebase.firestore.GeoPoint(lat, lng)
  }
  /// If doc exists update, otherwise set
  upsert<T>(ref: DocPredicate<T>, data: any) {
    const doc = this.doc(ref).snapshotChanges().take(1).toPromise()
    return doc.then(snap => {
      return snap.payload.exists ? this.update(ref, data) : this.set(ref, data)
    })
  }
  /// **************
  /// Inspect data
  /// **************
  /// Console log the snapshot of an observable and time its latency.
  /// Usage:
  /// this.db.inspectDoc('notes/xyz');
  /// this.db.inspectCol('notes');
  inspectDoc(ref: DocPredicate<any>): void {
    const tick = new Date().getTime()
    this.doc(ref).snapshotChanges()
        .take(1)
        .do(d => {
          const tock = new Date().getTime() - tick
          console.log(`Loaded Document in ${tock}ms`, d)
        })
        .subscribe()
  }
  inspectCol(ref: CollectionPredicate<any>): void {
    const tick = new Date().getTime()
    this.col(ref).snapshotChanges()
        .take(1)
        .do(c => {
          const tock = new Date().getTime() - tick
          console.log(`Loaded Collection in ${tock}ms`, c)
        })
        .subscribe()
  }
  /// **************
  /// Create and read doc references
  /// **************
  /// create a reference between two documents
  connect(host: DocPredicate<any>, key: string, doc: DocPredicate<any>) {
    return this.doc(host).update({ [key]: this.doc(doc).ref })
  }
  /// returns a document's references mapped to AngularFirestoreDocument
  docWithRefs$<T>(ref: DocPredicate<T>) {
    return this.doc$(ref).map(doc => {
      for (const k of Object.keys(doc)) {
        if (doc[k] instanceof firebase.firestore.DocumentReference) {
          doc[k] = this.doc(doc[k].path)
        }
      }
      return doc
    })
  }
  /// **************
  /// Delete a collection and all of its documents.
  /// Usage: this.db.deleteCollection('widgets', 5).subscribe();
  /// **************
  deleteCollection(path: string, batchSize: number): Observable<any> {

    const source = this.deleteBatch(path, batchSize)

    // expand will call deleteBatch recursively until the collection is deleted
    return source.pipe(
      expand(val => this.deleteBatch(path, batchSize)),
      takeWhile(val => val > 0)
   )

  }

  // Detetes documents as batched transaction
  private deleteBatch(path: string, batchSize: number): Observable<any> {
    const colRef = this.angularFireStore.collection(path, ref => ref.orderBy('__name__').limit(batchSize) )

    return colRef.snapshotChanges().pipe(
      take(1),
      mergeMap(snapshot => {

        // Delete documents in a batch
        const batch = this.angularFireStore.firestore.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.payload.doc.ref);
        });

        return fromPromise( batch.commit() ).map(() => snapshot.length)

      })
    )
  }
}
