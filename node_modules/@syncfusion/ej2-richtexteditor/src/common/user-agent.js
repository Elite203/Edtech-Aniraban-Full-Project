/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * This class returns the browser platform details from the user agent string.
 */
var CustomUserAgentData = /** @class */ (function () {
    function CustomUserAgentData(userAgent, testing) {
        this.userAgent = userAgent;
        this.isTesting = testing;
    }
    /**
     *
     * To get the platform name from the user agent string.
     *
     * @hidden
     * @returns {Platform} - Returns the platform name.
     */
    CustomUserAgentData.prototype.getPlatform = function () {
        if (!this.isTesting && window.navigator.userAgentData) {
            return window.navigator.userAgentData.platform;
        }
        if (/windows/i.test(this.userAgent)) {
            return 'Windows';
        }
        if (/macintosh|mac os/i.test(this.userAgent) && !(/iphone|ipad|ipod/i.test(this.userAgent))) {
            return 'macOS';
        }
        if (/linux/i.test(this.userAgent) && !(/android/i.test(this.userAgent))) {
            return 'Linux';
        }
        if (/iphone|ipad|ipod/i.test(this.userAgent)) {
            return 'iOS';
        }
        if (/android/i.test(this.userAgent)) {
            return 'Android';
        }
        return 'Unknown';
    };
    /**
     *
     * To get the platform name from the user agent string.
     *
     * @hidden
     * @returns {BrowserList} - Returns the platform name.
     */
    CustomUserAgentData.prototype.getBrowser = function () {
        // At 11th February 2025 the userAgentData API is only available in chromium based browsers. Need to update the logic once the api is widely available.
        var brands = [];
        if (!this.isTesting && window.navigator.userAgentData) {
            brands = window.navigator.userAgentData.brands;
            for (var _i = 0, brands_1 = brands; _i < brands_1.length; _i++) {
                var brand = brands_1[_i];
                if (brand.brand === 'Google Chrome') {
                    return 'Chrome';
                }
                else if (brand.brand === 'Microsoft Edge') {
                    return 'Edge';
                }
            }
        }
        if (/chrome|chromium|crios/i.test(this.userAgent) && !/edg/i.test(this.userAgent)) {
            return 'Chrome';
        }
        if (/firefox|fxios/i.test(this.userAgent) && !/edg/i.test(this.userAgent)) {
            return 'Firefox';
        }
        if (/safari/i.test(this.userAgent) && !/chrome|chromium|crios/i.test(this.userAgent)) {
            return 'Safari';
        }
        if (/edg/i.test(this.userAgent)) {
            return 'Edge';
        }
        return 'Unknown';
    };
    /**
     * To check whether the browser is a mobile device.
     *
     * @hidden
     * @returns {boolean} - Returns true if the device is a mobile device.
     */
    CustomUserAgentData.prototype.isMobileDevice = function () {
        if (!this.isTesting && window.navigator.userAgentData) {
            return window.navigator.userAgentData.mobile;
        }
        return /(iphone|ipod|ipad|android|blackberry|bb|playbook|windows phone|webos|opera mini|mobile)/i.test(this.userAgent);
    };
    /**
     * To check whether the browser is a mobile device.
     *
     * @hidden
     * @returns {boolean} - Returns true if the device is a mobile device.
     */
    CustomUserAgentData.prototype.isSafari = function () {
        var platform = this.getPlatform();
        return this.getBrowser() === 'Safari' && (platform === 'macOS' || platform === 'iOS');
    };
    return CustomUserAgentData;
}());
export { CustomUserAgentData };
