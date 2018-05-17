import React from "react";
import { ButtonCircle } from "rebass";
import MediumEditor from "medium-editor";
import micropub from "../../modules/micropub";

class PostCreator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      titleEditor: false,
      contentEditor: false
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {}

  handleOpen() {
    let titleEditor = this.state.titleEditor;
    let contentEditor = this.state.contentEditor;
    const templateEl = this.props.template;
    let contentEl = templateEl.querySelector(".e-content");
    let titleEl = templateEl.querySelector(".p-name");
    if (titleEl && titleEl.classList.contains("e-content")) {
      titleEl = null;
    }

    if (contentEl) {
      contentEl.innerHTML = "";
    } else {
      contentEl = document.createElement("div");
      contentEl.className = "e-content";
      templateEl.appendChild(contentEl);
    }

    if (!titleEl) {
      titleEl = document.createElement("h1");
      titleEl.className = "p-name";
      contentEl.parentElement.insertBefore(titleEl, contentEl);
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
      placeholder: {
        text: "Title",
        toolbar: false
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

    let mf2 = {
      type: ["h-entry"],
      properties: {}
    };

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
        window.location.href = url;
      })
      .catch(err => {
        console.log(err);
        alert("Error creating new post: " + err.message);
      });
  }

  render() {
    if (this.state.open) {
      return (
        <ButtonCircle onClick={this.handleSubmit}>Publish Post</ButtonCircle>
      );
    } else {
      return <ButtonCircle onClick={this.handleOpen}>Add Post</ButtonCircle>;
    }
  }
}

export default PostCreator;
