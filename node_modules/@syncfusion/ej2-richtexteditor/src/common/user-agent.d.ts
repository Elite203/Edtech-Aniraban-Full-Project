declare type BrowserList = 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Unknown';
declare type Platform = 'Windows' | 'macOS' | 'Linux' | 'iOS' | 'Android' | 'Unknown';
/**
 * This class returns the browser platform details from the user agent string.
 */
export declare class CustomUserAgentData {
    private userAgent;
    private isTesting;
    constructor(userAgent: string, testing: boolean);
    /**
     *
     * To get the platform name from the user agent string.
     *
     * @hidden
     * @returns {Platform} - Returns the platform name.
     */
    getPlatform(): Platform;
    /**
     *
     * To get the platform name from the user agent string.
     *
     * @hidden
     * @returns {BrowserList} - Returns the platform name.
     */
    getBrowser(): BrowserList;
    /**
     * To check whether the browser is a mobile device.
     *
     * @hidden
     * @returns {boolean} - Returns true if the device is a mobile device.
     */
    isMobileDevice(): boolean;
    /**
     * To check whether the browser is a mobile device.
     *
     * @hidden
     * @returns {boolean} - Returns true if the device is a mobile device.
     */
    isSafari(): boolean;
}
export {};
