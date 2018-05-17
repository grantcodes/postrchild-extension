import "medium-editor/dist/css/medium-editor.min.css";
import "medium-editor/dist/css/themes/default.min.css";

import browser from "webextension-polyfill";
import metadataparser from "page-metadata-parser";
import Microformats from "microformat-shiv";
import MediumEditor from "medium-editor";
import removeText from "./modules/remove-text";
import micropub from "./modules/micropub";

import React from "react";
import { render } from "react-dom";
import App from "./components/on-page-container";

const onPageContainer = document.createElement("div");
onPageContainer.style.position = "fixed";
onPageContainer.style.bottom = "20px";
onPageContainer.style.right = "20px";
onPageContainer.style.zIndex = 99999;
document.body.appendChild(onPageContainer);
render(<App />, onPageContainer);

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
