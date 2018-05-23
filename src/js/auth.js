import browser from "webextension-polyfill";

import micropub from "./modules/micropub";

const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const state = params.get("state");
const start = params.get("start");

browser.storage.local.get().then(store => {
  micropub.options.me = store.setting_micropubMe;
  micropub.options.tokenEndpoint = store.setting_tokenEndpoint;
  micropub.options.micropubEndpoint = store.setting_micropubEndpoint;

  if (start) {
    micropub
      .getAuthUrl()
      .then(url => {
        browser.storage.local
          .set({
            setting_tokenEndpoint: micropub.options.tokenEndpoint,
            setting_micropubEndpoint: micropub.options.micropubEndpoint
          })
          .then(() => (window.location = url));
      })
      .catch(err => {
        console.log(err);
        alert(err.message);
      });
  } else if (code && state && state == micropub.options.state) {
    micropub
      .getToken(code)
      .then(token => {
        browser.storage.local.set({ setting_micropubToken: token }).then(() => {
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
