<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no" />
    <meta name="theme-color" content="#000000" />


    <meta name="shopify-api-key" content="f85ee597169457da8ee70b6652cae768" />
    <meta name="shopify-disabled-features" content="auto-redirect" />
    <link rel="shortcut icon" href="https://cdn.pagefly.io/static/assets/favicon.png" />
    <link rel="manifest" href="https://cdn.pagefly.io/asset-manifest.json">
    <link rel="preconnect" href="https://cdn.shopify.com/" />
    <link rel="preload" as="image" type="image/svg+xml" href="https://cdn.pagefly.io/static/assets/loading-shimmer.svg" fetchpriority="high" />
    <link rel="stylesheet" href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css" />
    <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
    <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
    <title>PageFly - Advanced Page Builder</title>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-0BK6F6GXYF" id="pf-gtag"></script>
    <script async src="https://cdn.pagefly.io/static/assets/idb.js"></script>
    <script async src="https://cdn.pagefly.io/static/assets/console-factory.js"></script>
  <script type="module" crossorigin src="https://cdn.pagefly.io/pagefly/4.26.3.114/core/index.js"></script>
  <link rel="modulepreload" crossorigin href="https://cdn.pagefly.io/pagefly/4.26.3.114/js/admin-vendor.CrRD5JRz.chunk.js">
  <link rel="modulepreload" crossorigin href="https://cdn.pagefly.io/pagefly/4.26.3.114/js/styled-components.D8nL5D_J.chunk.js">
  <link rel="modulepreload" crossorigin href="https://cdn.pagefly.io/pagefly/4.26.3.114/js/element-store.DFrC6fqR.chunk.js">
  <link rel="stylesheet" crossorigin href="https://cdn.pagefly.io/pagefly/4.26.3.114/css/admin-vendor.3b1SCsF7.chunk.css">
  <link rel="stylesheet" crossorigin href="https://cdn.pagefly.io/pagefly/4.26.3.114/css/element-store.D0JiXcT6.chunk.css">
  <link rel="stylesheet" crossorigin href="https://cdn.pagefly.io/pagefly/4.26.3.114/css/index.DeLjGzT9.chunk.css">
</head>

<body>
    <!--Secret Script for Server Side Render-->
    <script>
        window.__INITIAL_DATA__ = null;
    </script>
    <!--End Secret Script for Server Side Render-->
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <style>
        @media screen and (max-width: 768px) {

            #crisp-chatbox,
            #crisp-chatbox textarea {
                font-size: max(16px, 1em) !important;
            }
        }
    </style>
    <!-- Boot loader painted before any JS executes. The shimmer is loaded via <img>
         (SVG file with embedded CSS animation — animation still runs inside <img>) because
         inline SVG paths are NEVER LCP candidates while <img> is: LCP registers at first
         paint instead of waiting for the app bundle + data fetches. The 280x280 box must
         stay larger than the biggest content element (~33k px^2) so it anchors LCP, and the
         file size keeps entropy above Chrome's 0.05 bits-per-pixel threshold. React's
         LoadingShimmer renders identical markup so the React mount causes no shift. -->
    <div id="root">
        <div style="position:fixed;inset:0;display:flex;justify-content:center;align-items:center;">
            <img src="https://cdn.pagefly.io/static/assets/loading-shimmer.svg" alt="PageFly is loading"
                fetchpriority="high" width="280" height="280" />
        </div>
    </div>
    <script type="text/javascript">
        const shopDomain = window.shopify?.config?.shop
        const LEGACY_VERSION = '4.15.13'
        const NEW_VERSION = '4.16.0'

        function compareVersions(v1, v2) {
            const v1Parts = v1.split('.').map(Number);
            const v2Parts = v2.split('.').map(Number);

            for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
                const v1Part = v1Parts[i] || 0;
                const v2Part = v2Parts[i] || 0;

                if (v1Part > v2Part) return 1;
                if (v1Part < v2Part) return -1;
            }

            return 0;
        }

        async function getPageInfoForEditorVersion(pageId) {
            try {
                const response = await fetch(`/api/v2/pages/metadata?pageId=${pageId}&shop=${shopDomain}`)
                if (response.status !== 200) {
                    // If error, force to old version for sure
                    return { version: '', isOldPricing: true }
                }
                const res = await response.json();

                return {
                    version: res.data.version || '',
                    isOldPricing: res.data.isOldPricing
                }
            } catch (error) {
                // console.log(error)
                // If error, force to old version for sure
                return {
                    version: '',
                    isOldPricing: true
                }
            }
        }

        // Init window.pagefly synchronously before any module loads
        if (!window.pagefly) window.pagefly = {}

            // Set initial isFlexEditor from URL params synchronously so module-level
            // constants that read window.pagefly.isFlexEditor get the correct value.
            // The full async init (with API check for isOldPricing) runs after and may
            // override this in initPageStore, but this gives modules a correct default.
            ; (function initSyncEditorVersion() {
                const location = window.location
                if (!location.pathname.includes('/editor')) return

                const searchParams = new URLSearchParams(location.search)
                const version = searchParams.get('editor') === 'gen-2' ? 'Flex' : 'Row_Column'
                window.pagefly.version = version
                window.pagefly.isFlexEditor = version === 'Flex'
            })()

        async function init() {
            const location = window.location
            const isEditor = location.pathname.includes('/editor')

            if (!isEditor || !shopDomain) return

            const searchParams = new URLSearchParams(location.search)
            const pageId = searchParams.get('id')
            const version = searchParams.get('editor') === 'gen-2' ? "Flex" : "Row_Column"
            const pageInfo = await getPageInfoForEditorVersion(pageId)
            const { version: _version, isOldPricing } = pageInfo
            const pageVersion = _version || version
            const isFlexEditor = pageVersion === 'Flex'

            window.pagefly.version = pageVersion
            window.pagefly.isFlexEditor = isFlexEditor
            window.pagefly.isOldPricing = isOldPricing
        }

        window.__pageflyReady = init()
    </script>
    <!-- Vite entry point (development: /src/index.tsx, production: generated by Vite) -->
</body>

</html>