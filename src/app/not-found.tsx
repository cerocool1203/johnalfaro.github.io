import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="container mx-auto px-4 h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
            <h1 className="text-6xl md:text-9xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Page Not Found</h2>
            <p className="text-xl text-muted-foreground max-w-lg mb-8">
                Your pixels are in another canvas. The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <Link
                href="/"
                className="px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
                Return Home
            </Link>
        </div>
    );
}
