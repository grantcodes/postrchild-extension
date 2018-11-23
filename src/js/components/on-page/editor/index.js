import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Draft, { composeDecorators } from "draft-js-plugins-editor";
import createLinkPlugin from "draft-js-anchor-plugin";
import createEmojiPlugin from "draft-js-emoji-plugin";
import createImagePlugin from "draft-js-image-plugin";
import createInlineToolbarPlugin, {
  Separator
} from "draft-js-inline-toolbar-plugin";
import createLinkifyPlugin from "draft-js-linkify-plugin";
import createMarkdownShortcutsPlugin from "draft-js-markdown-shortcuts-plugin";
import createVideoPlugin from "draft-js-video-plugin";
import createDividerPlugin from "draft-js-divider-plugin";
import createAlignmentPlugin from "draft-js-alignment-plugin";
import createFocusPlugin from "draft-js-focus-plugin";
import createBlockDndPlugin from "draft-js-drag-n-drop-plugin";
import createResizeablePlugin from "draft-js-resizeable-plugin";
import createMentionPlugin, {
  defaultSuggestionsFilter
} from "draft-js-mention-plugin";
import createSingleLinePlugin from "draft-js-single-line-plugin";
import {
  ItalicButton,
  BoldButton,
  CodeButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton
} from "draft-js-buttons";
import { EditorState } from "draft-js";
import { convertToHTML, convertFromHTML } from "./converter";
import addMediaUpload from "./addMediaUpload";
import getMentions from "../../../modules/get-mentions";

import "draft-js-inline-toolbar-plugin/lib/plugin.css";
import "draft-js-emoji-plugin/lib/plugin.css";
import "draft-js-image-plugin/lib/plugin.css";
import "draft-js-video-plugin/lib/plugin.css";
import "draft-js-anchor-plugin/lib/plugin.css";
import "draft-js-linkify-plugin/lib/plugin.css";
import "draft-js-divider-plugin/lib/plugin.css";
import "draft-js-alignment-plugin/lib/plugin.css";
import "draft-js-mention-plugin/lib/plugin.css";
// import "draft-js-drag-n-drop-plugin/lib/plugin.css";
// import "draft-js-resizeable-plugin/lib/plugin.css";
import "./editor.css";

const focusPlugin = createFocusPlugin();
const alignmentPlugin = createAlignmentPlugin();
const blockDndPlugin = createBlockDndPlugin();
const resizeablePlugin = createResizeablePlugin();

const { AlignmentTool } = alignmentPlugin;

const decorator = composeDecorators(
  alignmentPlugin.decorator,
  focusPlugin.decorator,
  blockDndPlugin.decorator
  // resizeablePlugin.decorator
);

const imagePlugin = createImagePlugin({
  decorator
  // imageComponent: imageProps => (
  //   <Fragment>
  //     <img src="https://placeimg.com/200/200" />
  //     {console.log('imageProps', imageProps)}
  //   </Fragment>
  // )
});
const videoPlugin = createVideoPlugin({ decorator });

// TODO: Want to create my own alignment tool that will add WordPress inspired classnames

const linkPlugin = createLinkPlugin();
const LinkButton = linkPlugin.LinkButton;
const inlineToolbarPlugin = createInlineToolbarPlugin();

const { InlineToolbar } = inlineToolbarPlugin;
const emojiPlugin = createEmojiPlugin({ useNativeArt: true });
const { EmojiSuggestions } = emojiPlugin;

const mentionPlugin = createMentionPlugin();
const { MentionSuggestions } = mentionPlugin;

const singleLinePlugin = createSingleLinePlugin({ stripEntities: true });

const plugins = [
  inlineToolbarPlugin,
  focusPlugin,
  blockDndPlugin,
  alignmentPlugin,
  // resizeablePlugin,
  createMarkdownShortcutsPlugin(),
  linkPlugin,
  imagePlugin,
  videoPlugin,
  createLinkifyPlugin(),
  createDividerPlugin(),
  emojiPlugin,
  mentionPlugin
];

let allMentions = [];

class Editor extends Component {
  constructor(props) {
    super(props);
    if (props.value) {
      console.log("Converting from html", props.value);
    }
    this.state = {
      editorState: props.value
        ? EditorState.createWithContent(convertFromHTML(props.value))
        : EditorState.createEmpty(),
      suggestions: allMentions
    };
  }

  async componentDidMount() {
    try {
      allMentions = await getMentions();
      this.setState({ suggestions: allMentions });
    } catch (err) {
      console.log("Error getting mentions", err);
    }
  }

  onChange = editorState => {
    const { onChange, rich } = this.props;
    this.setState({ editorState });
    if (onChange) {
      let html = convertToHTML(editorState.getCurrentContent());
      if (!rich) {
        html = html.replace("<p>", "").replace("</p>", "");
      }
      console.log("html", html);
      onChange(html);
    }
  };

  onSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(value, allMentions)
    });
  };

  handleFiles = files => {
    const { editorState } = this.state;
    for (const file of files) {
      addMediaUpload(this.onChange, editorState, file);
    }
  };

  focus = () => {
    this.editor.focus();
  };

  render() {
    const { rich, placeholder } = this.props;
    const { editorState, suggestions } = this.state;
    return (
      <div className="postrchild-editor" onClick={this.focus}>
        <Draft
          editorState={editorState}
          onChange={this.onChange}
          plugins={rich ? plugins : [singleLinePlugin]}
          placeholder={placeholder}
          spellCheck={true}
          handlePastedFiles={this.handleFiles}
          handleDroppedFiles={(selection, files) => this.handleFiles(files)}
          ref={element => {
            this.editor = element;
          }}
        />
        {rich && (
          <Fragment>
            {/* <AlignmentTool /> */}
            <EmojiSuggestions />
            <MentionSuggestions
              onSearchChange={this.onSearchChange}
              suggestions={suggestions}
              onAddMention={this.onAddMention}
            />
            <InlineToolbar>
              {externalProps => (
                <Fragment>
                  <ItalicButton {...externalProps} />
                  <BoldButton {...externalProps} />
                  <CodeButton {...externalProps} />
                  <HeadlineTwoButton {...externalProps} />
                  <HeadlineThreeButton {...externalProps} />
                  <UnorderedListButton {...externalProps} />
                  <OrderedListButton {...externalProps} />
                  <BlockquoteButton {...externalProps} />
                  <CodeBlockButton {...externalProps} />
                  <LinkButton {...externalProps} />
                </Fragment>
              )}
            </InlineToolbar>
          </Fragment>
        )}
      </div>
    );
  }
}

Editor.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  rich: PropTypes.bool.isRequired,
  onChange: PropTypes.func
};

Editor.defaultProps = {
  placeholder: "Content...",
  rich: true
};

export default Editor;
