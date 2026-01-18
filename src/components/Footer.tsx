export function Footer() {
    return (
        <footer className="py-8 border-t border-white/5 mt-20">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} John Alfaro. All rights reserved.</p>
            </div>
        </footer>
    );
}
