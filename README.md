# PostrChild Browser Extension

This is an experimental WebExtension that enables inline micropub publishing on your own website.

It may do more things in the future.

## Installation

### Firefox

[https://addons.mozilla.org/en-US/firefox/addon/postrchild/](https://addons.mozilla.org/en-US/firefox/addon/postrchild/)

### Chrome

[https://chrome.google.com/webstore/detail/ecifafdialoohbgngelfbjplgbhiklpm](https://chrome.google.com/webstore/detail/ecifafdialoohbgngelfbjplgbhiklpm)

### Build from souce

Clone this repo then run `npm install` and `npm run build` inside the root directory.

That should create a `/build` folder that you can install in your browser.

## Usage

First you will need to go into the options of the extension and provide your domain, micropub endpoint and an access token.

(I will add a login flow in the future)

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
