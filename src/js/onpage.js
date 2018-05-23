import "medium-editor/dist/css/medium-editor.min.css";
import "medium-editor/dist/css/themes/default.min.css";

import browser from "webextension-polyfill";
import metadataparser from "page-metadata-parser";
import Microformats from "microformat-shiv";
import MediumEditor from "medium-editor";
import micropub from "./modules/micropub";

import React from "react";
import { render } from "react-dom";
import App from "./components/on-page-container";

// Inject editor onto page
const onPageContainer = document.createElement("div");
onPageContainer.id = "app-container";
onPageContainer.style.position = "fixed";
onPageContainer.style.bottom = "20px";
onPageContainer.style.right = "20px";
onPageContainer.style.zIndex = 99999;
document.body.appendChild(onPageContainer);
render(<App />, onPageContainer);

// Redirect to extension auth.html page to complete authentication
if (
  window.location.href.indexOf(micropub.options.redirectUri) === 0 &&
  !micropub.options.token
) {
  // const redirect =
  //   browser.extension.getURL("/auth.html") + window.location.search;
  // if (redirect) {
  //   window.location = redirect;
  // }
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  browser.storage.local.get().then(store => {
    micropub.options.me = store.setting_micropubMe;
    micropub.options.tokenEndpoint = store.setting_tokenEndpoint;
    micropub.options.micropubEndpoint = store.setting_micropubEndpoint;

    if (code && state && state == micropub.options.state) {
      micropub
        .getToken(code)
        .then(token => {
          browser.storage.local
            .set({ setting_micropubToken: token })
            .then(() => {
              browser.tabs.getCurrent().then(tab => {
                if (tab && tab.id) {
                  browser.tabs.remove(tab.id);
                }
              });
            });
        })
        .catch(err => {
          console.log(err);
          alert(err.message);
          window.close();
        });
    }
  });
}

// Get MF2 data for the current page
browser.runtime.onMessage.addListener((request, sender) => {
  if (request.action == "getPageMF2") {
    const metadata = metadataparser.getMetadata(
      window.document,
      window.location
    );

    let mf2 = {
      type: ["h-entry"],
      properties: {
        name: [metadata.title],
        summary: [metadata.description],
        featured: [metadata.image],
        url: [window.location.url]
      }
    };

    const hEntries = document.getElementsByClassName("h-entry");

    if (hEntries && hEntries.length === 1) {
      const { items } = Microformats.get({ filters: ["h-entry"] });

      if (items && items.length === 1) {
        const item = items[0];
        if (Object.keys(item.properties).length > 1) {
          mf2 = item;
        }
      }
    }
    return Promise.resolve({ mf2: mf2 });
  }
});
