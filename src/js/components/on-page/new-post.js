import browser from "webextension-polyfill";
import React from "react";
import { Group, Button } from "rebass";
import Popout from "./popout";
import PopoutForm from "./popout-form";
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
    if (!micropub.options.mediaEndpoint) {
      micropub
        .query("config")
        .then(config => {
          if (config["media-endpoint"]) {
            micropub.options.mediaEndpoint = config["media-endpoint"];
          }
        })
        .catch(err => console.log("Micropub config error", err));
    }

    micropub
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
      upload.addEventListener("change", e => {
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
            micropub
              .postMedia(file)
              .then(url => {
                image.style.opacity = 1;
                image.title = "";
                image.src = url;
                console.log("photo posted to media endpoint", url);
                mf2.properties.photo.push(url);
                this.setState({ mf2 });
              })
              .catch(err => {
                browser.runtime
                  .sendMessage({ action: "getLastLocation" })
                  .then(res => {
                    if (res.location) {
                      const url = res.location;
                      image.style.opacity = 1;
                      image.title = "";
                      image.src = url;
                      mf2.properties.photo.push(url);
                      this.setState({ mf2 });
                    }
                  });
              });
          }
        }
      });
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
            <PopoutForm
              properties={this.state.mf2.properties}
              shownProperties={[
                "summary",
                "mp-slug",
                "visibility",
                "post-status"
                // "featured"
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
