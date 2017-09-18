/**
 * WEB RESPONSIVE JS
 * @author: Bruno Martin
 * Date: January 7th, 2015
 * Description:
 * It helps to match as many as possible devices without zoom issue.
 * 1~2% should not perfectly fit for touching, but stil readable
 * Note: It must be used with the viewport meta tag
 * <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
 */

/**
 * Object to check responsiveness
 */
var responsive = {
	isMobile: "only screen and (max-width: 479px)",
	isMobileL: "only screen and (min-width: 480px) and (max-width: 900px)",
	isTablet: "only screen and (min-width: 901px) and (max-width: 1279px)",
	isDesktop: "only screen and (min-width: 1280px)",

	minMobile: "",
	minMobileL: "only screen and (min-width: 480px)",
	minTablet: "only screen and (min-width: 901px)",
	minDesktop: "only screen and (min-width: 1280px)",

	noMobile: "only screen and (min-width: 480px)",
	noMobileL: "only screen and (min-width: 901px), only screen and (max-width: 479px)",
	noTablet: "only screen and (min-width: 1280px), only screen and (max-width: 900px)",
	noDesktop: "only screen and (max-width: 1279px)",

	maxMobile: "only screen and (max-width: 479px)",
	maxMobileL: "only screen and (max-width: 900px)",
	maxTablet: "only screen and (max-width: 1279px)",
	maxDesktop: "",

	/**
	 * Check if we are in the media requested
	 * @param {string} media - String like "isMobile" to check if we match it
	 * @return {boolean}
	 */
	test: function(media){
		if(window.matchMedia){
			if(typeof this[media]==="undefined"){
				return false;
			} else {
				if(window.matchMedia(this[media]).matches){
					return true;
				} else {
					return false;
				}
			}
		}
	}
}

