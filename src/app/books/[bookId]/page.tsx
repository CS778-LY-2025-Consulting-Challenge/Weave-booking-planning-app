'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBookById, GeneratedBook } from '@/lib/ai-books';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Share2, Printer, MapPin } from 'lucide-react';
import Image from 'next/image';
import HTMLFlipBook from 'react-pageflip';

export default function BookViewerPage() {
    const { bookId } = useParams();
    const router = useRouter();
    const [book, setBook] = useState<GeneratedBook | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (bookId) {
            getBookById(bookId as string).then(data => {
                setBook(data as GeneratedBook);
                setLoading(false);
            });
        }
    }, [bookId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-100">
                <div className="animate-pulse text-stone-500 font-serif text-xl">Opening your book...</div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100">
                <p className="text-stone-500 mb-4">Book not found</p>
                <Button onClick={() => router.push('/dashboard')}>Go Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100 py-12 px-4 overflow-hidden">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
                <Button variant="ghost" onClick={() => router.push('/dashboard')} className="hover:bg-stone-200">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" title="Share">
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" title="Print">
                        <Printer className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Book Container */}
            <div className="flex justify-center items-center perspective-1000">
                <Book book={book} />
            </div>
        </div>
    );
}

// Separate component for the FlipBook to isolate client-side heavy library
function Book({ book }: { book: unknown }) {
    // Type casting for safety if needed, but 'any' is often easiest for external libs
    const b = book as any;

    return (
        // @ts-ignore - react-pageflip types can be finicky
        <HTMLFlipBook width={500} height={700} showCover={true} className="shadow-2xl">
            {/* Cover */}
            <div className="demoPage bg-indigo-900 text-white p-8 flex flex-col items-center justify-center text-center border-l-8 border-indigo-950">
                <div className="w-full h-1/2 relative mb-8 overflow-hidden rounded-lg shadow-inner">
                    <Image
                        src={b.coverImage || '/images/paris-dashboard.jpg'}
                        alt="Cover"
                        fill
                        className="object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                </div>
                <h1 className="text-4xl font-serif font-bold mb-4 tracking-wider">{b.title}</h1>
                <p className="text-indigo-200 italic">{b.description}</p>
                <div className="mt-12 text-sm uppercase tracking-widest opacity-50">A Weave Journey</div>
            </div>

            {/* Chapters */}
            {b.chapters?.map((chapter: any, index: number) => (
                <div key={index} className="demoPage bg-[#fdfbf7] p-8 text-stone-800 border-r border-stone-200">
                    <div className="h-full border-2 border-stone-100 p-6 flex flex-col">
                        <div className="text-center border-b-2 border-stone-100 pb-4 mb-6">
                            <span className="font-serif italic text-stone-400 block mb-1">{chapter.day}</span>
                            <h2 className="text-2xl font-bold font-serif text-stone-800">{chapter.title}</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto prose prose-stone">
                            <p className="whitespace-pre-wrap leading-relaxed font-serif text-lg">
                                {chapter.content}
                            </p>
                        </div>

                        {/* If there are images for this chapter */}
                        {/* Placeholder for simplicity in prototype */}
                        <div className="mt-6 flex justify-center">
                            <div className="w-24 h-1 bg-stone-200 rounded-full" />
                        </div>
                        <div className="mt-2 text-center text-xs text-stone-300">
                            {index + 1}
                        </div>
                    </div>
                </div>
            ))}

            {/* Back Cover */}
            <div className="demoPage bg-indigo-950 text-white p-8 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-xl font-serif mb-2">The End</h3>
                    <p className="text-indigo-400 text-sm">Created with Weave AI</p>
                </div>
            </div>
        </HTMLFlipBook>
    );
}
