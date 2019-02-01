// configuration
var $hostname = '.your-hostname.here',
    $cookie_params = ['source', 'medium', 'campaign', 'term', 'content'];

function crumbleCookie(a) {
    for (var d = document.cookie.split(";"), c = {}, b = 0; b < d.length; b++) {
        var e = d[b].substring(0, d[b].indexOf("=")).trim(),
            i = d[b].substring(d[b].indexOf("=") + 1, d[b].length).trim();
        c[e] = i;
    }
    if (a) return c[a] ? c[a] : null;
    return c;
}

function bakeCookie(a, d, c, b, e, i) {
    var j = new Date();
    j.setTime(j.getTime());
    c && (c *= 864E5);
    j = new Date(j.getTime() + c);
    document.cookie = a + "=" + escape(d) + (c ? ";expires=" + j.toGMTString() : "") + (b ? ";path=" + b : "") + (e ? ";domain=" + e : "") + (i ? ";secure" : "");
}

/**
 * Write cookie as url string
 * use getTrafficSource() and bakeCookie()
 *
 * @param n Name of cookie to write
 *
 * @return void
 */
function writeLogic(n) {
    var a = getTrafficSource(n, $hostname);

    a = a.replace(/\|{2,}/g, "|");
    a = a.replace(/^\|/, "");
    a = unescape(a);

    bakeCookie(n, a, 182, "/", "", ""); // Cookie expiration sets to 182 days
}

/**
 * Read cookie saved as url and return object with key=>value
 *
 * @param n Name of cookie to read
 *
 * @returns object key=>value object of cookie
 */
function readLogic(n) {
    var cookie_string = crumbleCookie()[n], cookie_obj = {}, param;

    for (var key in $cookie_params) {
        param = $cookie_params[key];
        cookie_obj[param] = getParam('?' + decodeURIComponent(cookie_string), param);
    }

    return cookie_obj;
}

/**
 * Get Formatted string of cookie Referral
 *
 * @param n Cookie name
 *
 * @return string Formatted string of Referral
 */
function cookieToString(n) {
    var cookie_obj = readLogic(n);

    if (cookie_obj.source == 'direct') {
        return 'direct';
    } else {
        // open with brackets
        var attr_value = cookie_obj.source + ' (' + cookie_obj.medium;

        // add campaign name if exist
        if (typeof cookie_obj.campaign != 'undefined') {
            attr_value = attr_value + ' | ' + cookie_obj.campaign;
        }
        // add campaign term if exist
        if (typeof cookie_obj.term != 'undefined') {
            attr_value = attr_value + ' | term: ' + cookie_obj.term;
        }
        // add campaign content if exist
        if (typeof cookie_obj.content != 'undefined') {
            attr_value = attr_value + ' | content: ' + cookie_obj.content;
        }

        // close brackets
        attr_value = attr_value + ')';
    }

    // return string
    return attr_value;
}

/**
 * Get value of url query string param "?param=value"
 *
 * @param s Url query string "?parma=value"
 * @param q The param to retrieve
 *
 * @return {string} param value
 */
function getParam(s, q) {
    try {
        var match = s.match('[?&]' + q + '=([^&]+)');
        return match ? match[1] : '';
        // return s.match(RegExp('(^|&)'+q+'=([^&]*)'))[2];
    } catch (e) {
        return '';
    }
}

function calculateTrafficSource() {
    var source = '', medium = '', campaign = '', term = '', content = '';
    var search_engines = [['bing', 'q'], ['google', 'q'], ['yahoo', 'q'], ['baidu', 'q'], ['yandex', 'q'], ['ask', 'q'], ['libero.it', 'qs'], ['virgilio.it', 'q']]; //List of search engines

    var ref = document.referrer;
    ref = ref.substr(ref.indexOf('//') + 2);
    var ref_domain = ref,
        ref_path = '/',
        ref_search = '';

    // Checks for campaign parameters
    var url_search = document.location.search;

    // console.log(url_search.indexOf('utm_source'));
    // console.log(getParam(url_search, 'gclid'));
    // console.log(url_search);

    if (url_search.indexOf('utm_source') > -1) {
        source = getParam(url_search, 'utm_source');
        medium = getParam(url_search, 'utm_medium');
        campaign = getParam(url_search, 'utm_campaign');
        term = getParam(url_search, 'utm_term');
        content = getParam(url_search, 'utm_content');
    }
    else if (getParam(url_search, 'gclid')) {
        source = 'google';
        medium = 'cpc';
        campaign = 'gclid';
    }
    else if (ref) {
        // separate domain, path and query parameters
        if (ref.indexOf('/') > -1) {
            ref_domain = ref.substr(0, ref.indexOf('/'));
            ref_path = ref.substr(ref.indexOf('/'));
            if (ref_path.indexOf('?') > -1) {
                ref_search = ref_path.substr(ref_path.indexOf('?') + 1);
                ref_path = ref_path.substr(0, ref_path.indexOf('?'));
            }
        }
        medium = 'referral';
        source = ref_domain;
        // Extract term for organic source
        for (var i = 0; i < search_engines.length; i++) {
            if (ref_domain.indexOf(search_engines[i][0]) > -1) {
                medium = 'organic';
                source = search_engines[i][0];
                term = getParam(ref_search, search_engines[i][1]) || '(not provided)';
                break;
            }
        }
    }

    return {
        'source': source,
        'medium': medium,
        'campaign': campaign,
        'term': term,
        'content': content
    };
}

function getTrafficSource(cookieName, hostname) {
    var trafficSources = calculateTrafficSource();
    var source = trafficSources.source.length === 0 ? 'direct' : trafficSources.source;
    var medium = trafficSources.medium.length === 0 ? 'none' : trafficSources.medium;
    var campaign = trafficSources.campaign.length === 0 ? 'direct' : trafficSources.campaign;
    // exception
    if (medium === 'referral') {
        campaign = '';
    }

    var rightNow = new Date();
    var value = 'source=' + source +
        '&medium=' + medium +
        '&campaign=' + campaign +
        '&term=' + trafficSources.term +
        '&content=' + trafficSources.content +
        '&date=' + rightNow.toISOString().slice(0, 10).replace(/-/g, "");

    return value;
}

// Self-invoking function
(function () {
    var session = crumbleCookie()['js_referral'];

    // First time session
    if (typeof session == 'undefined') {
        writeLogic('js_referral');
    } else {
        writeLogic('js_referral_returned');
    }
})();
