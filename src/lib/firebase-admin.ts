import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function getFirebaseApp() {
    if (getApps().length) return getApp();

    let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson && !process.env.VERCEL) {
        try {
            serviceAccountJson = readFileSync(join(process.cwd(), 'src', 'lib', 'serviceAccountKey.json'), 'utf8');
        } catch {
            // Local development can use the ignored key file; deployments use the environment variable.
        }
    }

    if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured');
    }

    let serviceAccount: any;
    try {
        serviceAccount = typeof serviceAccountJson === 'object' ? serviceAccountJson : JSON.parse(serviceAccountJson);
        if (typeof serviceAccount === 'string') {
            serviceAccount = JSON.parse(serviceAccount);
        }
    } catch (parseError) {
        try {
            serviceAccount = JSON.parse(Buffer.from(serviceAccountJson, 'base64').toString('utf8'));
        } catch {
            throw new Error('FIREBASE_SERVICE_ACCOUNT contains invalid JSON. Please check your Vercel environment variable.');
        }
    }

    console.log('[FirebaseAdmin] Initializing with project:', serviceAccount.project_id);
    return initializeApp({
        credential: cert(serviceAccount),
        databaseURL: 'https://weave-travel-default-rtdb.asia-southeast1.firebasedatabase.app'
    });
}

export function getAdminDb() {
    return getFirestore(getFirebaseApp());
}

export function getAdminRtdb() {
    return getDatabase(getFirebaseApp());
}
