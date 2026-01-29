import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CTABlockProps {
    title: string;
    description?: string;
    buttonText: string;
    buttonUrl: string;
    style?: 'primary' | 'gradient' | 'outline';
}

export function CTABlock({ title, description, buttonText, buttonUrl, style = 'gradient' }: CTABlockProps) {
    const styles = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        gradient: "bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-primary/30",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
    };

    return (
        <section className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48" />

            <div className="relative z-10 p-12 md:p-16 text-center space-y-6">
                <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                    {title}
                </h2>

                {description && (
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {description}
                    </p>
                )}

                <div className="pt-4">
                    <Link
                        href={buttonUrl}
                        className={`inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all transform hover:scale-105 ${styles[style]}`}
                    >
                        {buttonText}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
