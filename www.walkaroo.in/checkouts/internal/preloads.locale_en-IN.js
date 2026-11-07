
    (function() {
      var preconnectOrigins = ["https://cdn.shopify.com"];
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.CZ0dCDgn.js","/cdn/shopifycloud/checkout-web/assets/c1/app.B29IurGB.js","/cdn/shopifycloud/checkout-web/assets/c1/630ba094.D60hzN4o.js","/cdn/shopifycloud/checkout-web/assets/c1/4509beb0.XKqHDYZw.js","/cdn/shopifycloud/checkout-web/assets/c1/6a2fc6d6.DpTniCJK.js","/cdn/shopifycloud/checkout-web/assets/c1/f025431a.BlsbPO0-.js","/cdn/shopifycloud/checkout-web/assets/c1/6ec9a0fa.DVsXYFp6.js","/cdn/shopifycloud/checkout-web/assets/c1/164ad2e3.BjT-x3lz.js","/cdn/shopifycloud/checkout-web/assets/c1/fb3b4968.C0l1WpBX.js","/cdn/shopifycloud/checkout-web/assets/c1/7d6bf786.5e4IeyFB.js","/cdn/shopifycloud/checkout-web/assets/c1/0f5b1987.D1UfC0UZ.js","/cdn/shopifycloud/checkout-web/assets/c1/9e5d8eb8.LM7m9FaB.js","/cdn/shopifycloud/checkout-web/assets/c1/a45fed45.CzJ5M9WC.js","/cdn/shopifycloud/checkout-web/assets/c1/c328865d.Bj11LM-n.js","/cdn/shopifycloud/checkout-web/assets/c1/f1384cc2.BX1JbjgR.js","/cdn/shopifycloud/checkout-web/assets/c1/4618373b.ET5d3EMx.js","/cdn/shopifycloud/checkout-web/assets/c1/486c3fda.L_k9udH2.js","/cdn/shopifycloud/checkout-web/assets/c1/17f6d6d8.DCalVmmM.js","/cdn/shopifycloud/checkout-web/assets/c1/19286c78.Dle8FguN.js","/cdn/shopifycloud/checkout-web/assets/c1/c7b92b97.Ccs47T0y.js","/cdn/shopifycloud/checkout-web/assets/c1/faece749.DSy27oBA.js","/cdn/shopifycloud/checkout-web/assets/c1/77d9e668.D6UH8CC9.js","/cdn/shopifycloud/checkout-web/assets/c1/e7cc4629.Bs4d4Es9.js","/cdn/shopifycloud/checkout-web/assets/c1/2c7267bc.BWQPAv3P.js","/cdn/shopifycloud/checkout-web/assets/c1/4661cd61.DCwpgP8C.js","/cdn/shopifycloud/checkout-web/assets/c1/928dbd30.IyKrVTTF.js","/cdn/shopifycloud/checkout-web/assets/c1/77821758.CIHBOvKY.js","/cdn/shopifycloud/checkout-web/assets/c1/82d59f8f.D39BedlL.js","/cdn/shopifycloud/checkout-web/assets/c1/08e2c58d.CKAx63tg.js","/cdn/shopifycloud/checkout-web/assets/c1/a8202753.DN3Pp9kt.js","/cdn/shopifycloud/checkout-web/assets/c1/dfb65aab.CkcPJeb3.js","/cdn/shopifycloud/checkout-web/assets/c1/e1177f6f.D0Gc0JH4.js","/cdn/shopifycloud/checkout-web/assets/c1/2f5db8a5.CB23nK3y.js","/cdn/shopifycloud/checkout-web/assets/c1/c0466e46.CVXk-no-.js","/cdn/shopifycloud/checkout-web/assets/c1/8d7e1337.D1SAQfdV.js","/cdn/shopifycloud/checkout-web/assets/c1/5bf177e7.CEF4RufY.js","/cdn/shopifycloud/checkout-web/assets/c1/f3089cd3.D6L10cI7.js","/cdn/shopifycloud/checkout-web/assets/c1/8da28279.UOn2VaL8.js","/cdn/shopifycloud/checkout-web/assets/c1/a541bc81.DTymQdJL.js","/cdn/shopifycloud/checkout-web/assets/c1/6b0dea54.CQTQTJcf.js","/cdn/shopifycloud/checkout-web/assets/c1/9c33421f.C5JKVLEW.js","/cdn/shopifycloud/checkout-web/assets/c1/37c3ef79.JduCqA9D.js","/cdn/shopifycloud/checkout-web/assets/c1/651bb548.D-aAKqUA.js","/cdn/shopifycloud/checkout-web/assets/c1/83f74304.BWq_1wRq.js","/cdn/shopifycloud/checkout-web/assets/c1/7edfee1d.CQDveBHb.js","/cdn/shopifycloud/checkout-web/assets/c1/ce604576.DRj3vMAG.js","/cdn/shopifycloud/checkout-web/assets/c1/b01c110b.DBv_Kcbc.js","/cdn/shopifycloud/checkout-web/assets/c1/4e32eceb.Brd5q1On.js","/cdn/shopifycloud/checkout-web/assets/c1/f00fed33.BcDUaHVI.js","/cdn/shopifycloud/checkout-web/assets/c1/94493b3a.BWglDuww.js","/cdn/shopifycloud/checkout-web/assets/c1/99cd9b25.DHjzk-_i.js","/cdn/shopifycloud/checkout-web/assets/c1/890c145f.DbSV10v2.js","/cdn/shopifycloud/checkout-web/assets/c1/676eb8e9.BdiCp2Ec.js","/cdn/shopifycloud/checkout-web/assets/c1/a9ee22a0.E5WNEd6f.js","/cdn/shopifycloud/checkout-web/assets/c1/56132226.CcnxSVod.js","/cdn/shopifycloud/checkout-web/assets/c1/0e3247a0.CLqacbNA.js","/cdn/shopifycloud/checkout-web/assets/c1/1dbf806c.D5m01WEx.js","/cdn/shopifycloud/checkout-web/assets/c1/a56386a6.BtKzfL0B.js","/cdn/shopifycloud/checkout-web/assets/c1/674595ba.CmFNZoCY.js","/cdn/shopifycloud/checkout-web/assets/c1/173d1fdf.Bkt2EmPL.js","/cdn/shopifycloud/checkout-web/assets/c1/0d85278a.DVcfWcMB.js","/cdn/shopifycloud/checkout-web/assets/c1/16138b9e.DohpuRJV.js","/cdn/shopifycloud/checkout-web/assets/c1/55432860.DI6OljUs.js","/cdn/shopifycloud/checkout-web/assets/c1/0be192b6.DZlKNY2U.js","/cdn/shopifycloud/checkout-web/assets/c1/2bce9289.IdSIKvKR.js","/cdn/shopifycloud/checkout-web/assets/c1/62a11d3e.jf4J-xaY.js","/cdn/shopifycloud/checkout-web/assets/c1/9a493f3d.10nSRRQg.js","/cdn/shopifycloud/checkout-web/assets/c1/402b40d8.DYCxuhQc.js","/cdn/shopifycloud/checkout-web/assets/c1/17db3e71.B4KZCO3S.js","/cdn/shopifycloud/checkout-web/assets/c1/b4f06cd6.CwW_AIzI.js","/cdn/shopifycloud/checkout-web/assets/c1/2b0d1656.RNKZGKow.js","/cdn/shopifycloud/checkout-web/assets/c1/64c3067d.Cq4KWveM.js","/cdn/shopifycloud/checkout-web/assets/c1/bbe16958.15NRRxdl.js","/cdn/shopifycloud/checkout-web/assets/c1/6a8181a5.LYXhyJjA.js","/cdn/shopifycloud/checkout-web/assets/c1/4205169c.DBWAS0x4.js","/cdn/shopifycloud/checkout-web/assets/c1/1befea5c.D2NiNjId.js","/cdn/shopifycloud/checkout-web/assets/c1/ff52cf6d.C-_S3LI1.js","/cdn/shopifycloud/checkout-web/assets/c1/74e5a557.CQr2auOd.js","/cdn/shopifycloud/checkout-web/assets/c1/f4d0afee.CBQgxqHw.js","/cdn/shopifycloud/checkout-web/assets/c1/0b704646.DBgRw5yq.js","/cdn/shopifycloud/checkout-web/assets/c1/a7ef2c81.BQkmaa-b.js","/cdn/shopifycloud/checkout-web/assets/c1/f0b3b291.SBbOqRlr.js","/cdn/shopifycloud/checkout-web/assets/c1/114cc9d1.C_JEseqR.js","/cdn/shopifycloud/checkout-web/assets/c1/e7ae9e74.CBUfFAZS.js","/cdn/shopifycloud/checkout-web/assets/c1/91e796b6.B702ZSiL.js","/cdn/shopifycloud/checkout-web/assets/c1/a222330e.BNx8s-kf.js","/cdn/shopifycloud/checkout-web/assets/c1/c380a132.Bp6OzWAQ.js","/cdn/shopifycloud/checkout-web/assets/c1/3839d836.CrVQObZG.js","/cdn/shopifycloud/checkout-web/assets/c1/72fde58e.BJIxulHJ.js","/cdn/shopifycloud/checkout-web/assets/c1/8cad6ded.P7hWcQyN.js","/cdn/shopifycloud/checkout-web/assets/c1/9e556116.pXgD7u8d.js","/cdn/shopifycloud/checkout-web/assets/c1/abf134e3.HlBDfHcc.js","/cdn/shopifycloud/checkout-web/assets/c1/e6a05f36.QIbSGGv1.js","/cdn/shopifycloud/checkout-web/assets/c1/8e6bd8e5.GeesMn2q.js","/cdn/shopifycloud/checkout-web/assets/c1/a012ee00.BSHOzmRo.js","/cdn/shopifycloud/checkout-web/assets/c1/7aefefff.B7clo6TM.js","/cdn/shopifycloud/checkout-web/assets/c1/38cb0284.BlLYP8Gq.js","/cdn/shopifycloud/checkout-web/assets/c1/bdb60128.C2WLDpJO.js","/cdn/shopifycloud/checkout-web/assets/c1/a0df1226.BJuPvKqi.js","/cdn/shopifycloud/checkout-web/assets/c1/8efef14b.DyOdR0xl.js","/cdn/shopifycloud/checkout-web/assets/c1/c1adaf81.Cx57sSL5.js","/cdn/shopifycloud/checkout-web/assets/c1/21162507.ZBi71-Xy.js","/cdn/shopifycloud/checkout-web/assets/c1/139f607b.DAiX0rcG.js","/cdn/shopifycloud/checkout-web/assets/c1/5f1fce8b.e4QsuNYD.js","/cdn/shopifycloud/checkout-web/assets/c1/bace9a08.BKI7j4lX.js","/cdn/shopifycloud/checkout-web/assets/c1/8e2be3f2.rR9CvqWH.js","/cdn/shopifycloud/checkout-web/assets/c1/2d034bf2.zkV7XcW3.js","/cdn/shopifycloud/checkout-web/assets/c1/972590c9.BGdihX0e.js","/cdn/shopifycloud/checkout-web/assets/c1/9961965b.qSpUesjh.js","/cdn/shopifycloud/checkout-web/assets/c1/bc751930.Dh3XXtum.js","/cdn/shopifycloud/checkout-web/assets/c1/842452fd.Bk4-Lfpu.js","/cdn/shopifycloud/checkout-web/assets/c1/a70a5b74.U975_zdt.js","/cdn/shopifycloud/checkout-web/assets/c1/b068efe0.Djd3DvIP.js","/cdn/shopifycloud/checkout-web/assets/c1/2692118b.brfsExgW.js","/cdn/shopifycloud/checkout-web/assets/c1/c4303b96.CE9NzVoV.js","/cdn/shopifycloud/checkout-web/assets/c1/7ee3a05c.dJKifCBb.js","/cdn/shopifycloud/checkout-web/assets/c1/0d8691fc.DCjMFdeJ.js","/cdn/shopifycloud/checkout-web/assets/c1/b0923a20.DxRv5XhW.js","/cdn/shopifycloud/checkout-web/assets/c1/7e9c6d7c.B6iNH7Xy.js","/cdn/shopifycloud/checkout-web/assets/c1/ea392d18.CzhzooYl.js","/cdn/shopifycloud/checkout-web/assets/c1/b2ef26e8.CcmoluyL.js","/cdn/shopifycloud/checkout-web/assets/c1/99bfe9cf.D8UYklGO.js","/cdn/shopifycloud/checkout-web/assets/c1/1493337c.BpH5kohb.js","/cdn/shopifycloud/checkout-web/assets/c1/3c46c6f5.B02hMylI.js","/cdn/shopifycloud/checkout-web/assets/c1/e29daa9a.v6jreNIE.js","/cdn/shopifycloud/checkout-web/assets/c1/b2371320.CLWBLS1C.js","/cdn/shopifycloud/checkout-web/assets/c1/a735741f.BAtVClvT.js","/cdn/shopifycloud/checkout-web/assets/c1/5a1effbb.DhQ-Gsyl.js","/cdn/shopifycloud/checkout-web/assets/c1/67e8c664.Cn07Rk_6.js","/cdn/shopifycloud/checkout-web/assets/c1/4bb32466.B6IFZTQ5.js","/cdn/shopifycloud/checkout-web/assets/c1/ed37d3c3.C6r5fn7d.js","/cdn/shopifycloud/checkout-web/assets/c1/30df5a02.DtuyT1gw.js","/cdn/shopifycloud/checkout-web/assets/c1/e32a8416.C8256JXZ.js","/cdn/shopifycloud/checkout-web/assets/c1/eb0f242a.DWYM7CpL.js","/cdn/shopifycloud/checkout-web/assets/c1/109c16d9.ChxOqMLw.js","/cdn/shopifycloud/checkout-web/assets/c1/35fb5eb6.ig8AaXeq.js","/cdn/shopifycloud/checkout-web/assets/c1/05f561d4.C1M-LmnK.js","/cdn/shopifycloud/checkout-web/assets/c1/69f8f26d.DyELgKpD.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.CGRs8DQS.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/deferred-boot.Cm6Z9krV.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OnePage.1nMCMpIm.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/256cc32287.B1YSPUDc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/a50c8864f4.Deiuu7T_.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/7188aae948xccd7bc85.Bi1nHaU-.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/90ea855f49.uZEuHncj.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/69c8bed031.BEvzDDvy.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/fed0657f2bxc9b4d095.CuRoM9zv.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/6e3faf45e1.Du9dByaI.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/6e3faf45e1x0e0212c9.ct4xfivv.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/c0d88fcb7bxbaeb52f9.BAjucZ-8.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/f409e9cd1fx9f0ef4a6.B0RErzdh.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/621ec27e44.Y7Bq8S4h.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/5caf6ce603.87JMHPUK.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/de4d443464.DPEapfiO.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/966e3f4d79.gzvCNwz_.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/d4951797f3.CtjKurIY.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/df684aa9a8.B0R7Gq-A.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/f2a87b867b.DAtTnerS.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/4d60858badxb036935a.xO_7ctnq.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/65db0eadda.qa_ACxP4.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/5a34f22f1a.FOMlDqkM.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/e8404cbaefx27591707.B68J3GgF.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/7aa3c6599b.C5b9n-0_.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/e07f74760d.DU0m5rdF.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/e07f74760dxbaeb52f9.skObByU9.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/6559bc5a39x1573b800.vTcdVGq4.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/89f3b0bff6.D7Ujmshx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/500596e378.CyQZvZOO.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/bde15ff106x11e90a44.t4ylkATc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/04e578408ax11e90a44.KhTiKgPS.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/04e578408ax6d8a6990.DpLOWYa8.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/d34ebf45edx11e90a44.btyKOfco.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/81ca749d51x11e90a44.DrWvAMMF.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/d455ee2f96x11e90a44.B0R8BMTd.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/d455ee2f96x670d76d4.BbxB_6wt.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/d455ee2f96x03fe6ed3.CVKcAbIN.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/d455ee2f96xd17a0c7b.BULdn7yC.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/343ea67e0bx11e90a44.s-Kd_X2E.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/401ac968b4x11e90a44.JBO5WNhc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/81ca749d51.DRJckcGa.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = ["https://cdn.shopify.com/s/files/1/0779/3380/5887/files/walkaroo-logo_x320.jpg?v=1691822261"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = preconnectOrigins.concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  