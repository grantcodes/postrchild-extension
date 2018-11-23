import browser from "webextension-polyfill";
import React from "react";
import { render } from "react-dom";
import { Group, Button } from "rebass";
import Popout from "./popout";
import PopoutForm from "./popout-form";
import micropub from "../../modules/micropub";
import * as templateUtils from "../../modules/template-utils";
import Editor from "./editor";

class PostCreator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      popoutOpen: false,
      title: "",
      content: "",
      mf2: {
        type: "h-entry",
        properties: {}
      }
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleMf2Change = this.handleMf2Change.bind(this);
  }

  async componentDidMount() {
    try {
      if (!micropub.options.mediaEndpoint) {
        const config = await micropub.query("config");
        if (config["media-endpoint"]) {
          micropub.options.mediaEndpoint = config["media-endpoint"];
        }
      }

      const res = await micropub.query("syndicate-to");
      if (res["syndicate-to"]) {
        this.setState({ syndicationProviders: res["syndicate-to"] });
      }
    } catch (err) {
      console.log("Error querying micropub endpoint", err);
    }

    this.handleOpen();
  }

  handleMf2Change(mf2) {
    this.setState({ mf2: mf2 });
  }

  async handleOpen() {
    const templateEl = this.props.template;
    let contentEl = templateUtils.getContentEl(templateEl);
    let titleEl = templateUtils.getTitleEl(templateEl);

    if (contentEl) {
      contentEl.innerHTML = "";
      render(
        <Editor onChange={content => this.setState({ content })} />,
        contentEl
      );
    } else {
      alert("Error getting the content container");
    }

    if (titleEl) {
      titleEl.innerHTML = "";
      render(
        <Editor
          onChange={title => this.setState({ title })}
          placeholder="Title..."
          rich={false}
        />,
        titleEl
      );
    }

    // Photo upload
    const photoEl = templateEl.querySelector(".u-photo");
    if (micropub.options.mediaEndpoint && photoEl) {
      let upload = document.createElement("input");
      let previews = document.createElement("div");
      let previewImg = photoEl.getElementsByTagName("img");
      upload.type = "file";
      upload.multiple = "multiple";
      upload.style.display = "block";
      photoEl.appendChild(upload);
      photoEl.appendChild(previews);
      upload.addEventListener("change", async e => {
        previews.innerHTML = "";
        for (let i = 0; i < upload.files.length; i++) {
          const file = upload.files[i];
          if (file.type.startsWith("image/")) {
            const image = document.createElement("img");
            if (previewImg && previewImg[0] && previewImg[0].className) {
              image.className = previewImg[0].className;
            }
            image.src = URL.createObjectURL(file);
            image.style.display = "block";
            image.style.margin = "0 auto";
            image.style.opacity = 0.5;
            image.style.transition = "opacity .5s";
            image.title = "uploading...";

            previews.appendChild(image);

            let mf2 = this.state.mf2;
            if (!mf2.properties.photo) {
              mf2.properties.photo = [];
            }
            try {
              const url = await micropub.postMedia(file);
              image.style.opacity = 1;
              image.title = "";
              image.src = url;
              console.log("photo posted to media endpoint", url);
              mf2.properties.photo.push(url);
              this.setState({ mf2 });
            } catch (err) {
              console.log("Error posting photo", err);
            }
          }
        }
      });
    }
  }

  async handleSubmit() {
    try {
      const { title, content } = this.state;
      let mf2 = this.state.mf2;

      if (title) {
        mf2.properties.name = [title];
      }

      if (content) {
        mf2.properties.content = [{ html: content }];
      }

      const url = await micropub.create(mf2);
      if (typeof url == "string") {
        // Sometimes chrome returns a string on success?
        window.location.href = url;
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.log("Error creating post", err);
      alert("Error creating new post: " + err.message);
    }
  }

  handleCancel() {
    const templateEl = this.props.template;
    let contentEditor = this.state.contentEditor;
    let titleEditor = this.state.titleEditor;
    if (titleEditor) {
      titleEditor.destroy();
    }
    if (contentEditor) {
      contentEditor.destroy();
    }
    templateEl.remove();
    document.getElementById("postrchild-extension-app-container").remove();
  }

  render() {
    const sidebarProperties = [
      "summary",
      "mp-slug",
      "visibility",
      "post-status"
      // "featured"
    ];
    if (
      this.state.syndicationProviders &&
      this.state.syndicationProviders.length
    ) {
      sidebarProperties.push("mp-syndicate-to");
    }
    return (
      <React.Fragment>
        <Group>
          <Button onClick={this.handleSubmit}>Publish</Button>
          <Button
            onClick={() => this.setState({ popoutOpen: true })}
            title="Post options"
          >
            ⚙
          </Button>
          <Button onClick={this.handleCancel} title="Cancel">
            ❌
          </Button>
        </Group>
        <Popout open={this.state.popoutOpen}>
          <PopoutForm
            properties={this.state.mf2.properties}
            shownProperties={sidebarProperties}
            onChange={this.handleMf2Change}
            syndication={this.state.syndicationProviders}
          />
        </Popout>
      </React.Fragment>
    );
  }
}

export default PostCreator;
