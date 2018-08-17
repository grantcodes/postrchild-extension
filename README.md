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

At the moment the editor only supports `name` and `content` properties.

### New Post Template

When creating a new inline post for you to edit, the extension tries to grab the first post on the page and use that as a template. But this can lead to some visual formatting issues.

So you have the option to include a "New Post Template" which will be injected and editor fields will be loaded into it.

It should have a `h` tag with a `p-name` class and an empty element with a class of `e-content`.

For example I use something like this for my own site:

```
<article class="h-entry post card">
  <header>
    <h1 class="p-name post__title"></h1>
  </header>
  <div class="e-content"></div>
  <footer class=" post__footer">Being written now by Grant Richmond</footer>
</article>
```
