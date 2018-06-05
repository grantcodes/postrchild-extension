import browser from "webextension-polyfill";
import React from "react";
import { hot } from "react-hot-loader";
import { ButtonCircle } from "rebass";
import Theme from "./theme";
import PostEditor from "./on-page/edit-post";
import PostCreator from "./on-page/new-post";
import micropub from "../modules/micropub";
import { sanitizeTemplate, removeText } from "../modules/template-utils";

class OnPageContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      action: false,
      firstHEntry: null,
      createTemplate: null
    };
  }

  componentDidMount() {
    // if (window.location.href.indexOf(micropub.options.me) === 0) {
    // On the authed site, so check if we should load editor stuff
    const hEntries = document.getElementsByClassName("h-entry");
    if (hEntries) {
      if (hEntries.length === 1) {
        this.setState({ action: "edit", firstHEntry: hEntries[0] });
      } else if (hEntries.length > 1) {
        browser.storage.local
          .get("setting_newPostTemplate")
          .then(template => {
            if (template && template.setting_newPostTemplate) {
              let tmpTemplate = document.createElement("div");
              tmpTemplate.innerHTML = template.setting_newPostTemplate.trim();
              template = tmpTemplate;
            } else {
              // Create a template based off the last post.
              template = sanitizeTemplate(hEntries[0]);
            }
            this.setState({
              action: "add",
              firstHEntry: hEntries[0],
              createTemplate: template
            });
          })
          .catch(err => {
            console.log(err);
            this.setState({
              action: "add",
              firstHEntry: hEntries[0],
              createTemplate: removeText(hEntries[0])
            });
          });
      }
    }
    // }
  }

  render() {
    switch (this.state.action) {
      case "edit":
        return (
          <Theme>
            <PostEditor post={this.state.firstHEntry} />
          </Theme>
        );
        break;
      case "add":
        return (
          <Theme>
            <PostCreator
              firstPost={this.state.firstHEntry}
              template={this.state.createTemplate}
            />
          </Theme>
        );

      default:
        return null;
        break;
    }
  }
}

export default hot(module)(OnPageContainer);
