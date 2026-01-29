"use client";

import React, { createContext, useContext } from "react";

interface SystemSettingsContextType {
    settings: Record<string, string>;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({
    children,
    settings
}: {
    children: React.ReactNode;
    settings: Record<string, string>;
}) {
    return (
        <SystemSettingsContext.Provider value={{ settings }}>
            {children}
        </SystemSettingsContext.Provider>
    );
}

export function useSystemSettings() {
    const context = useContext(SystemSettingsContext);
    if (context === undefined) {
        // Return defaults if outside provider to stay safe
        return {
            settings: {
                default_avatar: "/images/default-avatar.png",
            }
        };
    }
    return context;
}
