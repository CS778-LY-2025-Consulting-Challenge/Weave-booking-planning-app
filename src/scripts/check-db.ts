
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore'; // Note: regular firestore export doesn't have listDatabases usually? 
// Actually listDatabases is on the FirestoreClient which is lower level, but Admin SDK v11+ exposes it via Firestore object management?
// Let's use the v1 REST API client logic or try standard adminDb.

// Better approach: Use the HTTP API directly to list databases if SDK is confusing, 
// OR try to access keys directly.
// Let's stick to simple SDK access first.

import * as fs from 'fs';
import * as path from 'path';

async function listDatabases() {
    console.log('--- Checking Databases ---');
    try {
        const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

        const app = initializeApp({
            credential: cert(serviceAccount)
        }, 'db-lister');

        const db = getFirestore(app);

        // listing collections failed, so let's try to see if we can guess the DB name or just error out.
        // There isn't a direct "listDatabases" on the high level API easily accessible in all versions.
        // But we can try to access the default.

        console.log('Testing default database connectivity...');
        try {
            const cols = await db.listCollections();
            console.log('Default DB Collections:', cols.map(c => c.id));
        } catch (e: any) {
            console.log('Default DB Connection Failed:', e.message);
        }

    } catch (e) {
        console.error(e);
    }
}
listDatabases();
