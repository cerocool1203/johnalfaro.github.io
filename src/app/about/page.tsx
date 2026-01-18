import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About | The Cloud Journey',
    description: 'About John Alfaro and The Cloud Journey',
};

export default function About() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                About
            </h1>

            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
                <a href="https://www.buymeacoffee.com/cerocool" target="_blank" rel="noopener noreferrer">
                    <img
                        src="https://user-images.githubusercontent.com/1376749/120938564-50c59780-c6e1-11eb-814f-22a0399623c5.png"
                        alt="Buy Me A Coffee"
                    />
                </a>

                <p>Hello everyone, and welcome to my blog!</p>

                <p>
                    My name is John Alfaro, originally hailing from Bogota, Colombia, and I've been happily residing in Melbourne, Australia, for the past 13 years. Since 2022, I've been in Abu Dhabi, where I'm dedicated to making the cloud right. My passion lies in all things automation and, naturally, the Cloud.
                </p>

                <p>
                    I'm always eager to connect with like-minded individuals, so feel free to reach out to me via X <a href="https://twitter.com/j_alex_alfaro" target="_blank" rel="noopener noreferrer">@j_alex_alfaro</a>. I'm interested in hearing your thoughts, as well as any specific topics or challenges you're facing that I may have encountered as well. Let's engage and learn from each other!
                </p>
            </div>
        </div>
    );
}
