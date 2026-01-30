declare module 'fb' {
    export class Facebook {
        constructor(options?: { accessToken?: string; appId?: string; appSecret?: string; version?: string });
        api(path: string, method?: string, params?: any): Promise<any>;
        setAccessToken(token: string): void;
    }
}
