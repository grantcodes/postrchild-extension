import browser from "webextension-polyfill";
import Micropub from "micropub-helper";

const micropub = new Micropub({
  clientId: "https://grant.codes",
  redirectUri: "https://postrchild.com/auth",
  state: "This should be grant.codes secret or randomly generated per user"
});

browser.storage.local.get().then(store => {
  micropub.options.me = store.setting_micropubMe;
  micropub.options.token = store.setting_micropubToken;
  micropub.options.micropubEndpoint = store.setting_micropubEndpoint;
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area == "local") {
    Object.keys(changes).forEach(key => {
      const value = changes[key].newValue;
      if (key.indexOf("setting_") === 0) {
        key = key.replace("setting_", "");
        micropub.options[key] = value;
      }
    });
  }
});

export default micropub;
