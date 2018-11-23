import browser from "webextension-polyfill";
import micropub from "./modules/micropub";

import React from "react";
import { render } from "react-dom";
import Theme from "./components/theme";
import EditPost from "./components/on-page/edit-post";
import NewPost from "./components/on-page/new-post";
import { getNewPostTemplate } from "./modules/template-utils";

(async () => {
  // Complete auth if on micropub redirect page
  if (
    window.location.href.indexOf(micropub.options.redirectUri) === 0 &&
    !micropub.options.token
  ) {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    try {
      const store = await browser.runtime.sendMessage({
        action: "getSettings"
      });
      micropub.options.me = store.setting_micropubMe;
      micropub.options.tokenEndpoint = store.setting_tokenEndpoint;
      micropub.options.micropubEndpoint = store.setting_micropubEndpoint;

      if (code && state && state == micropub.options.state) {
        const token = await micropub.getToken(code);
        await browser.storage.local.set({ setting_micropubToken: token });
        // TODO: Call to background js to close tab and send notification
        alert("PostrChild Extension all set up. You may close this tab");
      }
    } catch (err) {
      console.log("Error getting access token", err);
      alert("Uh oh, there was an error getting the access token");
    }
  }
})();

const createOnPageContainer = () => {
  const existing = document.getElementById(
    "postrchild-extension-app-container"
  );
  if (existing) {
    return false;
  }
  const onPageContainer = document.createElement("div");
  onPageContainer.id = "postrchild-extension-app-container";
  onPageContainer.className = "postrchild-extension-app-container";
  onPageContainer.style.position = "fixed";
  onPageContainer.style.bottom = "20px";
  onPageContainer.style.right = "20px";
  onPageContainer.style.zIndex = 99999;
  document.body.appendChild(onPageContainer);
  return onPageContainer;
};

// Respond to browser api messages
browser.runtime.onMessage.addListener((request, sender) => {
  switch (request.action) {
    case "discoverPageAction":
      const templateEl = document.getElementsByClassName("postrchild-template");
      if (templateEl.length > 0) {
        return Promise.resolve({ action: "new" });
      }
      const hEntries = document.getElementsByClassName("h-entry");
      if (hEntries.length === 1) {
        return Promise.resolve({ action: "edit" });
      }
      return Promise.resolve({ action: "new" });
      break;
    case "showEditor":
      // Inject editor onto page
      const editorContainer = createOnPageContainer();
      if (editorContainer) {
        render(
          <Theme>
            <EditPost post={document.getElementsByClassName("h-entry")[0]} />
          </Theme>,
          editorContainer
        );
      }
      break;
    case "showNewPost":
      // Inject new post editor onto page
      const newPostContainer = createOnPageContainer();
      if (newPostContainer) {
        getNewPostTemplate().then(template => {
          const hEntries = document.getElementsByClassName("h-entry");
          render(
            <Theme>
              <NewPost template={template} />
            </Theme>,
            newPostContainer
          );
        });
      }
      break;
  }
  return false;
});
