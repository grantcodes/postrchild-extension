import React from "react";
import { Group, Button } from "rebass";
import Popout from "./popout";
import Mf2Editor from "../mf2-editor";
import MediumEditor from "medium-editor";
import micropub from "../../modules/micropub";
import * as templateUtils from "../../modules/template-utils";

class PostCreator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      popoutOpen: false,
      titleEditor: false,
      contentEditor: false,
      mf2: {
        type: "h-entry",
        properties: {}
      }
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleMf2Change = this.handleMf2Change.bind(this);
  }

  componentDidMount() {
    let thing = micropub
      .query("syndicate-to")
      .then(res => {
        if (res["syndicate-to"]) {
          this.setState({ syndicationProviders: res["syndicate-to"] });
        }
      })
      .catch(err => console.log("Error getting syndication providers", err));
  }

  handleMf2Change(mf2) {
    this.setState({ mf2: mf2 });
  }

  handleOpen() {
    let titleEditor = this.state.titleEditor;
    let contentEditor = this.state.contentEditor;
    const templateEl = this.props.template;
    let contentEl = templateUtils.getContentEl(templateEl);
    let titleEl = templateUtils.getTitleEl(templateEl);

    if (contentEl) {
      contentEl.innerHTML = "";
    } else {
      alert("Error getting the content container");
    }

    if (titleEl) {
      titleEl.innerHTML = "";
    }

    this.props.firstPost.parentElement.insertBefore(
      templateEl,
      this.props.firstPost
    );

    contentEditor = new MediumEditor(contentEl, {
      placeholder: {
        text: "Insert post content here"
      }
    });
    titleEditor = new MediumEditor(titleEl, {
      toolbar: false,
      placeholder: {
        text: "Title"
      }
    });

    this.setState({ open: true, titleEditor, contentEditor });
  }

  handleSubmit() {
    let contentEditor = this.state.contentEditor;
    let titleEditor = this.state.titleEditor;
    const content = contentEditor.getContent();
    const title = titleEditor.getContent();
    titleEditor.destroy();
    contentEditor.destroy();

    let mf2 = this.state.mf2;

    if (title) {
      mf2.properties.name = [title];
    }

    if (content) {
      mf2.properties.content = [content];
    }

    micropub
      .create(mf2)
      .then(url => {
        this.setState({ open: false, titleEditor: null, contentEditor: null });
        if (typeof url == "string") {
          // Sometimes chrome returns a string on success?
          window.location.href = url;
        } else {
          window.location.reload();
        }
      })
      .catch(err => {
        console.log(err);
        alert("Error creating new post: " + err.message);
      });
  }

  render() {
    if (this.state.open) {
      return (
        <React.Fragment>
          <Group>
            <Button onClick={this.handleSubmit}>Publish</Button>
            <Button onClick={() => this.setState({ popoutOpen: true })}>
              ⚙
            </Button>
          </Group>
          <Popout open={this.state.popoutOpen}>
            <Mf2Editor
              properties={this.state.mf2.properties}
              hiddenProperties={[
                "name",
                "content",
                "in-reply-to",
                "like-of",
                "bookmark-of",
                "in-reply-to",
                "summary",
                "featured"
              ]}
              onChange={this.handleMf2Change}
              syndication={this.state.syndicationProviders}
            />
          </Popout>
        </React.Fragment>
      );
    } else {
      return <Button onClick={this.handleOpen}>Add Post</Button>;
    }
  }
}

export default PostCreator;
