# UTM and Referral Cookie 
###### (utm_referral-cookie.js)
Get traffic referral sources or utm_params and save it to cookies (for __first time visit__ and the __last one__)

&nbsp;

Demo: https://arturmamedov.github.io/utm_referral-cookie/index.html

Demo with specified params: [index.html?utm_source=GitHub&utm_medium=affiliate&utm_campaign=user123](https://arturmamedov.github.io/utm_referral-cookie/index.html?utm_source=GitHub&utm_medium=affiliate&utm_campaign=user123)

&nbsp;

### Installation

##### Bower
```
bower install utm_referral-cookie --save
```

-------------------

#### Insert into page, and configure

```js
// Inside file configure this thing:

// * Required
$hostname = 'arturmamedov.github.io', // your-hostname-goes.here

// [] Optional
// Params you want to save in cookie
$cookie_params = ['source', 'medium', 'campaign', 'term', 'content'];

// List of search engines to track like organic referral
var $search_engines = [['bing', 'q'], ['google', 'q'], ['yahoo', 'q'], ['baidu', 'q'] ...];

// List of socials to track like social referral
var $socials = [['facebook'], ['twitter'], ['instagram'], ...];
```

```html
<!-- And simply add to page -->
<script src="utm_referral-cookie.js"></script>
```


Create one or two cookies with referral sources of user that visit the website

| Cookie name   | Purpose       |
| :------------ |:--------------|
| `utm_referral` | the __first visit__ of user, remain the same at every successive visit |
| `utm_referral_returned` | the __last user visit__, change every time the user visit website *(when referral is on a different domain or `utm_params` are set)* |

### Now it also add automatically to a hidden input if defined
So you can not care about how to print data, simply create input with id #utm_referral-input

```
<input name="utm_referral-cookie" id="utm_referral-input" type="hidden" value="" />

<!-- example: value="Referral 1: google (cpc | gclid) - Referral 2: direct" -->
```

##### For read cookies you can use:
at the bottom of this doc there a more practic code yet ready for use

```js

// this return the cookie as it is (so you must decode it fo read)
var session = crumbleCookie('utm_referral'), // encoded cookie with all params
    session2 = crumbleCookie('utm_referral_returned');

// First time session (only the first time visit)
if (typeof session != 'undefined') {
    // use decodeURIComponent(...) for get decoded full cookie string 
    document.getElementById('utm_referral').innerHTML = decodeURIComponent(session);
    
    // use readLogic('cookie_name') for retrieve object with configured $cookie_params
    console.log(readLogic('utm_referral')); 
    
    // use cookieToString(...) for format to string
    console.log(cookieToString('utm_referral')); // formatted string "source (medium | campaign | term: term | content: content)"
}
// Last time session (ever the last time visit)
if (typeof session2 != 'undefined') {
    // use decodeURIComponent(...) for get decoded full cookie string
    document.getElementById('utm_referral_returned').innerHTML = decodeURIComponent(session2);
    
    // use readLogic('cookie_name') for retrieve object with configured $cookie_params
    console.log(readLogic('utm_referral_returned')); // object {source, medium, campaign, term, content}
    
    // use cookieToString(...) for format to string
    console.log(cookieToString('utm_referral_returned')); // formatted string "source (medium | campaign | term: term | content: content)"
}

```  

##### Formats with `cookieToString()`:

- direct

- someweb.site (referral)

- google (cpc | gclid)

- google (cpc | CampaignName | term: if, set | content: if set)

- newsletter (email | campaignName | term: uno, due, tre | content: content)

- google (organic | term: (not provided))

- arianna.libero.it (organic | term: query of search)

- bing.com (organic | term: query of search)

- also: yahoo, yandex, baidu, ask, virgilio `(organic)` you can configure $search_engines

- facebook (social)

- instagram (social)

- also: twitter, flickr, tumblr, vimeo, youtube, pinterest `social` you can configure $socials

Example: You can use it in a hidden input in forms for submit info about referrals

---

##### Script doesn't track the same domain referral page's.

So if you want some link to be tracked as referral for save it, you need to define [utm_ parameters](https://ga-dev-tools.appspot.com/campaign-url-builder/)

```html
<a href="index.html?utm_source=internal&utm_medium=website&utm_campaign=page">URL with utm_ params</a>

<!-- Will be: internal (website | page) -->
``` 


#### General code for get booth cookies 
if it set and if the script is present on page

```javascript
// JavaScript output:   Referral: google (organic | direct) Referral 2: facebook (cpc | your_campaign) 

// Add utm_referral to mail - depends on https://github.com/arturmamedov/utm_referral-cookie
if (typeof cookieToString != 'undefined' && typeof cookieToString('utm_referral') != 'undefined') {
    var utm_referral_returned = '';
    if (typeof cookieToString('utm_referral_returned') != 'undefined') {
        utm_referral_returned = ' - Referral 2: ' + cookieToString('utm_referral_returned');
    }
    var utm_referral = 'Referral: ' + cookieToString('utm_referral') + utm_referral_returned;

    var with_booth_cookies = utm_referral; // or only one, it depend what cookies are yet set
}

```

```php
// PHP output: Referral: google (organic | direct) 
// 		Referral 2: direct  
// in HTML: <p><span class="lbl">Referral: </span><b class="value">google (organic | direct)</b><br>Referral 2: direct</p

// utm_referral cookie
if ($_COOKIE['utm_referral']) {
    // utm_referral_returned cookie
    $utm_referral_returned = '';
    if ($_COOKIE['utm_referral_returned']) {
        // format cookie that are an url
        $frmt = [];
        parse_str($_COOKIE['utm_referral_returned'], $frmt);
        $utm_referral_returned = "<br>Referral 2: {$frmt['source']} ({$frmt['medium']}";
        $utm_referral_returned .= ($frmt['campaign']) ? " | {$frmt['campaign']})" : ")"; // add campaign name and/or close bracket
        $utm_referral_returned = ($frmt['source'] == 'direct') ? '<br>Referral 2: direct' : $utm_referral_returned; // override if direct only
    }

    // create formatted output
    $frmt = [];
    parse_str($_COOKIE['utm_referral'], $frmt);
    $formatted = "{$frmt['source']} ({$frmt['medium']}";
    $formatted .= ($frmt['campaign']) ? " | {$frmt['campaign']})" : ")"; // add campaign name and/or close bracket
    $formatted = ($frmt['source'] == 'direct') ? 'direct' : $formatted; // override if direct only

    $message .= '<p>';
    $message .= '<span class="lbl">Referral: </span>';
    $message .= '<b class="value">'.$formatted.'</b>'.$utm_referral_returned;
    $message .= '</p>';
}

return $message;
}
```

---

__CREDITS__:

- [Buonsito.it](https://www.buonsito.it) WebAgency // Marketing // Site // SEO // Consulting //
- [FirstDigital](http://www.firstdigital.co.nz/blog/2015/07/22/retrieve-traffic-sources-data-without-google-analytics-cookies/) Analytics, Conversion, Performance Media, SEO
