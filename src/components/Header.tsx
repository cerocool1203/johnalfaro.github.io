import Link from 'next/link';
import { Github, Twitter, Linkedin, Coffee, Mail } from 'lucide-react';

export function Header() {
    return (
        <header className="fixed top-0 w-full z-50 glass border-b border-white/5">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    The Cloud Journey
                </Link>
                <nav className="flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                        About
                    </Link>
                    <Link href="/tags" className="text-sm font-medium hover:text-primary transition-colors">
                        Tags
                    </Link>
                    <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
                        Categories
                    </Link>
                    <div className="flex items-center gap-4 pl-4 border-l border-zinc-800">
                        <a href="mailto:j.alex.alfaro@gmail.com" className="hover:text-primary transition-colors text-muted-foreground" title="Contact Me">
                            <Mail size={20} />
                        </a>
                        <a href="https://www.buymeacoffee.com/cerocool" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-muted-foreground" title="Buy me a coffee">
                            <Coffee size={20} />
                        </a>
                        <a href="https://github.com/cerocool1203" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-muted-foreground">
                            <Github size={20} />
                        </a>
                        <a href="https://twitter.com/j_alex_alfaro" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-muted-foreground">
                            <Twitter size={20} />
                        </a>
                        <a href="https://www.linkedin.com/in/john-alex-alfaro/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-muted-foreground">
                            <Linkedin size={20} />
                        </a>
                    </div>
                </nav>
            </div>
        </header>
    );
}
