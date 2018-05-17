import React from "react";
import { ButtonCircle } from "rebass";
import MediumEditor from "medium-editor";
import micropub from "../../modules/micropub";

class PostEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      titleEditor: false,
      contentEditor: false
    };
    this.loadEditor = this.loadEditor.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {}

  handleEdit() {
    this.setState({ open: true });
    this.loadEditor();
  }

  handleSubmit() {
    let titleEditor = this.state.titleEditor;
    let contentEditor = this.state.contentEditor;

    const title = titleEditor ? titleEditor.origElements.innerText : null; // This method makes sure we get a string
    const content = contentEditor ? contentEditor.getContent() : null;

    if (titleEditor) {
      titleEditor.destroy();
      titleEditor = null;
    }
    if (contentEditor) {
      contentEditor.destroy();
      contentEditor = null;
    }

    if (content || title) {
      let update = {
        replace: {}
      };

      if (title) {
        update.replace.name = [title];
      }
      if (content) {
        update.replace.content = [content];
      }

      micropub
        .update(window.location.href, update)
        .then(res => {
          this.setState({
            open: false,
            titleEditor,
            contentEditor
          });
          alert("Post updated!");
        })
        .catch(err => {
          console.log(err);
          this.setState({
            open: false,
            titleEditor,
            contentEditor
          });
          alert("Error updating post: " + err.message);
        });
    }
  }

  loadEditor() {
    const postEl = this.props.post;
    let titleEl = postEl.querySelector(".p-name");
    if (titleEl && titleEl.classList.contains("e-content")) {
      titleEl = null;
    }
    const contentEl = postEl.querySelector(".e-content");
    let titleEditor = this.state.titleEditor;
    let contentEditor = this.state.contentEditor;
    if (!contentEl) {
      alert("Error finding your content to edit.");
    }
    micropub
      .querySource(window.location.href)
      .then(post => {
        if (
          titleEl &&
          post.properties &&
          post.properties.name &&
          post.properties.name[0]
        ) {
          titleEl.innerText = post.properties.name[0];
          titleEditor = new MediumEditor(titleEl, { toolbar: false });
        }
        if (
          contentEl &&
          post.properties &&
          post.properties.content &&
          post.properties.content[0]
        ) {
          const content = post.properties.content[0];
          if (typeof content == "object" && content.html) {
            contentEl.innerHTML = content.html;
          } else if (typeof content == "string") {
            contentEl.innerText = content;
          }
          contentEditor = new MediumEditor(contentEl);
        }
        this.setState({
          titleEditor,
          contentEditor
        });
      })
      .catch(err => console.log("Query error", err));
    // editor.subscribe("editableInput", (event, editable) => {
    // });
  }

  render() {
    if (this.state.open) {
      return <ButtonCircle onClick={this.handleSubmit}>Save Post</ButtonCircle>;
    } else {
      return <ButtonCircle onClick={this.handleEdit}>Edit Post</ButtonCircle>;
    }
  }
}

export default PostEditor;
