"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { useSystemSettings } from "@/components/providers/SystemSettingsProvider";

interface UserAvatarProps {
    src?: string | null;
    alt?: string;
    size?: number;
    className?: string;
}

export default function UserAvatar({ src, alt = "User", size, className }: UserAvatarProps) {
    const { settings } = useSystemSettings();
    const defaultAvatar = settings?.default_avatar || "/images/default-avatar.png";
    const [imageSrc, setImageSrc] = useState<string | null>(src || defaultAvatar);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        setImageSrc(src || defaultAvatar);
        setIsError(false);
    }, [src, defaultAvatar]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div
            className={cn("relative rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center", className)}
            style={{
                width: size,
                height: size,
                fontSize: size ? size * 0.4 : undefined
            }}
        >
            {!isError && imageSrc ? (
                <Image
                    src={imageSrc}
                    alt={alt}
                    fill
                    className="object-cover"
                    sizes={`${size || 96}px`}
                    unoptimized={typeof imageSrc === 'string' && imageSrc.startsWith('data:')}
                    onError={() => {
                        if (imageSrc === defaultAvatar) {
                            setIsError(true);
                        } else {
                            setImageSrc(defaultAvatar);
                        }
                    }}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black uppercase tracking-tighter">
                    {getInitials(alt)}
                </div>
            )}
        </div>
    );
}
