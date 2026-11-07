document.addEventListener("DOMContentLoaded", () => {

    const WHITE_LISTED_STAGING_DOMAINS = [
        'bik-manifest.myshopify.com',
        'tanmays-test-store.myshopify.com',
        'oonth-staging.web.app',
    ];

    const BASE_URL = {
        true: 'bikapi.bikayi.app',
        false: 'api.staging.bik.ai',
    }

    function getCookie(name) {
        let cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            let [key, value] = cookie.trim().split('=');
            if (key === name) return decodeURIComponent(value);
        }
        return null;
    }

    function setCookie(name, value, days = 1, path = "/") {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=${path}`;
    }

    function getRandomString() {
        const x = 2147483648;
        return (
          Math.floor(Math.random() * x).toString(36) +
          Math.abs(Math.floor(Math.random() * x) ^ Date.now()).toString(36)
        );
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getCustomerId(){
        const customerId = localStorage.getItem('bikCustomerId') || getRandomString();
        localStorage.setItem('bikCustomerId', customerId);
        return customerId;
    };

    function getDeviceType(){
        const userAgent = navigator.userAgent.toLowerCase();
        if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
          if (/tablet|ipad/i.test(userAgent)) {
            return 'tablet';
          } else {
            return 'mobile';
          }
        } else {
          return 'desktop';
        }
    };

    function pushEventEmbed(type, eventName){
        let visitorSessionId = getCookie('_manifest_s');
        if(!visitorSessionId) {
            visitorSessionId = generateUUID();
            setCookie('_manifest_s', visitorSessionId, 1);
            setCookie('_manifest_e', '', 1)
        }

        const manifestE = getCookie('_manifest_e');
        if(manifestE.split('|').includes(`${eventName}-${type}`)){
            return
        }

        let isProd = false
        const domainLink = (window)?.Shopify?.shop ?? (window?.location?.hostname || '')
        isProd = !(
            domainLink.includes('manifest-staging') || WHITE_LISTED_STAGING_DOMAINS.includes(domainLink)
        )

        const pageType = window?.bik_context?.pageType || 'HOME';
        const eventIdentifier = type;
        const storeId = window.localStorage.getItem('manifestStoreId');

        const url = `https://${
            BASE_URL[`${isProd}`]
          }/integrations/bikPlatformFunctions-recordManifestEvent`;
        const customerId = getCustomerId();

        const recordEventRequest = {
            eventType: 'BIK',
            bikEventPayload: {
                storeId: storeId,
                customerId,
                eventName: eventName,
                isCounterEvent: true,
                eventProperties: {
                    eventIdentifier: eventIdentifier,
                    entryPoint: pageType,
                    url: window.location.href,
                    isOpenAi: true,
                    device: getDeviceType(),
                },
            },
        }

        const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(recordEventRequest),
        };


        fetch(url, options)
            .then((response) => response.json())
            .then((data) => {
                if (data?.status === 200) {
                    const manifestE = getCookie('_manifest_e');
                    const next = manifestE ? `${manifestE}|${eventName}-${type}` : `${eventName}-${type}`;
                    setCookie('_manifest_e', next, 1)
                }
            }
        )
            .catch((error) => console.error('Error:', error));
    }


    window.pushEventEmbed = pushEventEmbed;
});