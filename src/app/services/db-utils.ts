export function convertSnapshotsFromFS<T>(snapshot): T[] {
    // snapshot - 1 array of items inside:
    // [ 0: {type: "added", payload: {…}}
    // 1: {type: "added", payload: {…}} ]
    return snapshot.map(snap => {
        // snap - 1 separate item:
        // {type: "added", payload: {…}}
        return <T>{
            id: snap.payload.doc.id,
            // @ts-ignore
            ...snap.payload.doc.data()
        };
    });
}
