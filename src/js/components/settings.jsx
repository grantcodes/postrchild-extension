import browser from "webextension-polyfill";
import React, { Component, Fragment } from "react";
import { Button, Label, Input, Textarea, Switch, Small } from "rebass";
import Tabs, { TabPane } from "./popup-tabs";

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      micropubMe: "",
      micropubToken: "",
      micropubEndpoint: "",
      newPostTemplate: ""
    };
    browser.storage.local.get().then(store => {
      this.setState({
        micropubMe: store.setting_micropubMe,
        micropubToken: store.setting_micropubToken,
        micropubEndpoint: store.setting_micropubEndpoint,
        newPostTemplate: store.setting_newPostTemplate
      });
    });

    this.handleLogin = this.handleLogin.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderBasicItem = this.renderBasicItem.bind(this);
  }

  componentDidMount() {}

  handleLogin() {
    window
      .open(browser.extension.getURL("auth.html?start=true"), "_blank")
      .focus();
  }

  handleChange(name) {
    return e => {
      let update = {};
      update["setting_" + name] = e.target.value;
      browser.storage.local.set(update);
      this.setState({ [name]: e.target.value });
    };
  }

  renderBasicItem(key, label) {
    return (
      <Fragment>
        <Label htmlFor={"setting" + key}>{label}</Label>
        <Input
          mb={3}
          type="text"
          value={this.state[key]}
          id={"setting" + key}
          onChange={this.handleChange(key)}
        />
      </Fragment>
    );
  }

  render() {
    return (
      <form>
        <Tabs>
          <TabPane label="Micropub">
            {this.renderBasicItem("micropubMe", "Domain")}
            {this.state.micropubToken ? (
              <Fragment>
                {this.renderBasicItem("micropubEndpoint", "Micropub endpoint")}
                {this.renderBasicItem("micropubToken", "Micropub token")}
              </Fragment>
            ) : (
              <Button
                disabled={!this.state.micropubMe}
                onClick={this.handleLogin}
                mb={3}
              >
                Login
              </Button>
            )}

            <Label htmlFor={"newPostTemplate"}>New Post Template</Label>
            <Textarea
              mb={3}
              style={{ resize: "vertical" }}
              rows={10}
              value={this.state.newPostTemplate}
              id={"newPostTemplate"}
              onChange={this.handleChange("newPostTemplate")}
            />
            <Small>
              Here you can write blank html code for how posts are displayed on
              your site. Make sure to include the classes "p-name" on your title
              and "e-content" on your content area or the extension will not
              work. Note: This will also automatically be wrapped in a plain
              &lt;div&gt; element.
            </Small>
          </TabPane>
        </Tabs>
      </form>
    );
  }
}

export default Settings;
