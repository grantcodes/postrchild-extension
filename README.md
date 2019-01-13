# PostrChild Browser Extension

This is an experimental WebExtension that enables inline micropub publishing on your own website.

## What does it do?

This extension allows you to publish and edit posts to your [IndieWeb](https://indieweb.org) enabled website via [micropub](https://indieweb.org/micropub)

Editing is done inline by looking for micropub classes on your site and loading a medium style editor.

### Experimental features

As well as creating and editing posts the extension is also able to automatically synchronize your browser bookmarks with bookmarks on your website if you support micropub queries [as discussed here](https://github.com/indieweb/micropub-extensions/issues/4)

## Installation

### Firefox

[https://addons.mozilla.org/en-US/firefox/addon/postrchild/](https://addons.mozilla.org/en-US/firefox/addon/postrchild/)

### Chrome

[https://chrome.google.com/webstore/detail/ecifafdialoohbgngelfbjplgbhiklpm](https://chrome.google.com/webstore/detail/ecifafdialoohbgngelfbjplgbhiklpm)

### Build from souce

Clone this repo from https://github.com/grantcodes/postrchild-extension.git then run `npm install` and `npm run build` inside the root directory.

That should create a `/build` folder and a .zip file that you can install in your browser.

## Usage

First you will need to go into the options of the extension and provide your domain to login with indieauth and obtain a micropub token.

After that when you browse to your own website you should see a button to add a new post, or if you are viewing a single post, a button to edit that post.

### New Post Template

There are a number of options to add a new post template.

My personal favorite is to create a special new post page that you can visit on your site to autoload the editor. You probably want to no-index the page, but it doesn't need to be secure as the editor is only loaded in your browser, other people cannot post to your website. The template should follow the same rules as below but also add the `postrchild-template` classname to the `h-entry` and the extension will automatically load the new post editor on your site if you are logged in.

When creating a new inline post for you to edit, the extension tries to grab the first post on the page and use that as a template. But this can lead to some visual formatting issues.

So you have the option to include a "New Post Template" which will be injected and editor fields will be loaded into it.

It should have a container with a `h-entry` class, with a `p-name` class element and another element with a class of `e-content`.

For example I use something like this for my own site:

```html
<article class="h-entry post card">
  <header><h1 class="p-name post__title"></h1></header>
  <div class="e-content"></div>
  <footer class=" post__footer">Being written now by Grant Richmond</footer>
</article>
```

### Alignment

You can align certain items to a wide or full width if your website supports the styles.

You need to style the `alignfull` and `alignwide` classes. This should be built into WordPress themes with full gutenberg support.

![Photo alignment example](https://grant.codes/media/2019/01/13/alignment.gif)

### Markdown Shortcuts

If you start a paragraph with ### and a space it will turn that block into a h3, if you start with a > you get a blockquote, etc.

![Markdown shortcuts example](https://grant.codes/media/2019/01/13/markdown-shortcuts.gif)

### Mentions

You can @mention IndieWeb people.

![Mention example](https://grant.codes/media/2019/01/13/mentions.gif)
