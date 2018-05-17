import browser from "webextension-polyfill";
import { Box, Button, Input, Label, Divider } from "rebass";
import React from "react";
import * as bookmarks from "../modules/bookmarks";
import micropub from "../modules/micropub";
micropub.query("bookmarks").then(posts => console.log(posts));

class BookmarkForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { bookmarks: [], parentId: "0" };

    this.handleBookmark = this.handleBookmark.bind(this);
  }

  componentDidMount() {
    browser.tabs.query({ active: true }).then(tabs => {
      if (tabs && tabs.length === 1) {
        let tab = tabs[0];
        tab.folder = "";
        bookmarks.get().then(bookmarks => {
          const existing = bookmarks.find(bookmark => bookmark.url == tab.url);
          if (existing) {
            tab.local = true;
            if (existing.parentId) {
              const parent = bookmarks.find(
                bookmark => bookmark.id == existing.parentId
              );
              if (parent && parent.title) {
                tab.folder = parent.title;
              }
            }
          }
          browser.tabs
            .sendMessage(tab.id, { action: "getPageMF2" })
            .then(res => {
              const mf2 = res.mf2;
              this.setState({ ...tab, bookmarks, mf2 });
            });
        });
      } else {
        // TODO: Maybe there is more than one active tab, or no tabs
        alert("Some sort of tab issue?");
      }
    });
  }

  handleBookmark() {
    const tab = this.state;

    let mf2 = bookmarks.toMf2(tab.url, tab.title, tab.folder);
    if (this.state.mf2) {
      mf2.refs = { [tab.url]: this.state.mf2 };
    }

    // Save to browser bookmarks
    bookmarks.create(tab.title, tab.url, tab.folder, tab.parentId).then(() => {
      // micropub
      //   .create(mf2)
      //   .then(url => {
      //     alert("Posted to " + url);
      //   })
      //   .catch(err => alert("Error posting bookmark"));
      // alert(JSON.stringify(mf2));
    });
  }

  render() {
    if (!this.state.url) {
      return (
        <Box p={4} style={{ textAlign: "center" }}>
          <marquee>Getting tab info</marquee>
        </Box>
      );
    }

    const tab = this.state;
    const folders = this.state.bookmarks
      .filter(bookmark => !bookmark.url && bookmark.id && bookmark.title)
      .map(bookmark => ({ value: bookmark.id, text: bookmark.title }));

    return (
      <form>
        <Label htmlfor="bookmarkname">Name</Label>
        <Input
          mb={3}
          id="bookmarkname"
          type="text"
          value={tab.title}
          required={true}
          onChange={e =>
            this.setState({
              title: e.target.value
            })
          }
        />

        <Label htmlfor="bookmarkurl">url</Label>
        <Input
          mb={3}
          id="bookmarkurl"
          type="url"
          value={tab.url}
          required={true}
          onChange={e =>
            this.setState({
              url: e.target.value
            })
          }
        />

        <Label htmlfor="bookmarkfolder">Folder / categories</Label>
        <Input
          mb={3}
          id="bookmarkfolder"
          type="text"
          value={tab.folder}
          list="bookmarkfoldersdatalist"
          required={true}
          onChange={e =>
            this.setState({
              folder: e.target.value
            })
          }
        />
        <datalist id="bookmarkfoldersdatalist">
          {folders.map(folder => <option value={folder.text} />)}
        </datalist>

        <Divider />

        {this.state.local ? (
          <Button disabled={true} type="primary" htmlType="submit">
            Already Bookmarked
          </Button>
        ) : (
          <Button
            type="primary"
            htmlType="submit"
            onClick={this.handleBookmark}
          >
            Add Bookmark
          </Button>
        )}
      </form>
    );
  }
}

export default BookmarkForm;
