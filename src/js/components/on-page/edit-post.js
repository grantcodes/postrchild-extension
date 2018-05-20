import React from "react";
import { Group, Button } from "rebass";
import Popout from "./popout";
import Mf2Editor from "../mf2-editor";
import MediumEditor from "medium-editor";
import micropub from "../../modules/micropub";

class PostEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      popoutOpen: false,
      titleEditor: false,
      contentEditor: false,
      mf2: {
        properties: {}
      }
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
        replace: this.state.mf2.properties
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
        if (post && post.properties) {
          this.setState({ mf2: post });
        }
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
      return (
        <React.Fragment>
          <Group>
            <Button onClick={this.handleSubmit}>Save Post</Button>
            <Button onClick={() => this.setState({ popoutOpen: true })}>
              ⚙
            </Button>
          </Group>
          <Popout open={this.state.popoutOpen}>
            <Mf2Editor
              onChange={mf2 => this.setState({ mf2 })}
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
              ].filter(
                name => typeof this.state.mf2.properties[name] == "undefined"
              )}
            />
          </Popout>
        </React.Fragment>
      );
    } else {
      return <Button onClick={this.handleEdit}>Edit Post</Button>;
    }
  }
}

export default PostEditor;
