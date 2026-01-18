'use client';

export function Hero({ latestPostSlug }: { latestPostSlug?: string }) {
    return (
        <div className="py-24 md:py-32 relative overflow-hidden">
            {/* Background Splash Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/assets/images/splash.jpg"
                    alt="Background"
                    className="w-full h-full object-cover opacity-80"
                />
                {/* Gradient Overlays for fade effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50 z-0" />

            <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                        Exploring the <span className="text-primary">Cloud</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
                        A bit of everything around cloud, specifically around Azure. Join me on my journey through infrastructure as code and cloud architecture.
                    </p>
                    <div className="flex gap-4 justify-center md:justify-start">
                        <a href={latestPostSlug ? `/posts/${latestPostSlug}` : "#latest-posts"} className="px-8 py-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all font-medium">
                            Read Latest
                        </a>
                        <a href="/about" className="px-8 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-all font-medium border border-white/10">
                            About Me
                        </a>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full transform scale-110"></div>
                    <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full p-2 border border-primary/20 bg-zinc-900/50 backdrop-blur-sm">
                        <div className="w-full h-full rounded-full overflow-hidden relative">
                            <img
                                src="/assets/images/me.jpg"
                                alt="John Alfaro"
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                onError={(e) => {
                                    // Fallback if image not found
                                    (e.target as HTMLImageElement).src = "https://github.com/cerocool1203.png";
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
