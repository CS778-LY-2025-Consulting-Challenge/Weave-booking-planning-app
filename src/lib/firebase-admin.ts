import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require('../../service-account.json');

if (!getApps().length) {
    console.log('[FirebaseAdmin] Initializing with project:', serviceAccount.project_id);
    initializeApp({
        credential: cert(serviceAccount),
        databaseURL: 'https://weave-travel-default-rtdb.asia-southeast1.firebasedatabase.app'
    });
} else {
    console.log('[FirebaseAdmin] Already initialized');
}

const adminDb = getFirestore();
const adminRtdb = getDatabase();

export { adminDb, adminRtdb };
