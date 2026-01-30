import { firestore } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export interface GeneratedBook {
    id: string;
    userId: string;
    title: string;
    coverImage: string;
    description: string;
    createdAt: any;
    status: 'draft' | 'published';
}

export async function getGeneratedBooks(userId: string): Promise<GeneratedBook[]> {
    try {
        const booksRef = collection(firestore, 'generatedBooks');
        const q = query(
            booksRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as GeneratedBook[];
    } catch (error) {
        console.error('Error fetching generated books:', error);
        return [];
    }
}

export async function getBookById(bookId: string) {
    // We already have generic fetching, but this helper is good for the detail page
    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(firestore, 'generatedBooks', bookId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() };
        }
        return null;
    } catch (error) {
        console.error("Error getting book", error);
        return null;
    }
}
