document.addEventListener("DOMContentLoaded", () => {
  const bikShowLocalVar = () => {
    const currentPage = window?.bik_context?.pageType;
    let checkKey = currentPage;
    if (currentPage === "PRODUCT") {
      checkKey = String(window?.bik_context?.productData?.id);
    }

    const flagStr = window?.localStorage?.getItem("bik-show-chat");
    let flagObj;
    try {
      flagObj = flagStr ? JSON.parse(flagStr) : {};
    } catch (e) {
      flagObj = {};
    }

    if (!(checkKey in flagObj)) return; // as the widgets will be shown by default

    const buttonParents = window?.document?.getElementsByClassName("manifest-widget-common");
    Array.from(buttonParents).forEach(element => {
      element.style.display = "none";
    });
  };

  const addStyleElement = () => {
    // Create and inject the first <style> tag for Shopify chat
    let shopifyChatStyle = document.createElement("style");
    shopifyChatStyle.type = "text/css";
    shopifyChatStyle.id = "support-hide-shopify-chat";
    shopifyChatStyle.innerHTML = `
      #ShopifyChat {
        display: none !important;
      }

      #dummy-chat-button-iframe {
        display: none !important;
      }

      #shopify-chat {
        display: none !important;
      }

      shopify-chat {
        display: none !important;
      }
    `;
    // Create and inject the second <style> tag for Gorgias inbox
    let gorgiasInboxStyle = document.createElement("style");
    gorgiasInboxStyle.type = "text/css";
    gorgiasInboxStyle.id = "support-hide-gorgias-inbox";
    gorgiasInboxStyle.innerHTML = `
      #gorgias-chat-container {
        display: none !important;
      }

      #chat-button {
        display: none !important;
      }
    `;
    document.head.appendChild(shopifyChatStyle);
    document.head.appendChild(gorgiasInboxStyle);
  };

  //Kill Switch
  // document
  //     .querySelectorAll(".manifest-widget-common, #bik-chat-root, #bik-chat-root-embed")
  //     .forEach((el) => el.remove());
  // console.warn("Manifest services suspended via emergency kill switch due server maintenance!");
  bikShowLocalVar();
  addStyleElement();
});
