import React from "react";
import {
  convertFromHTML as originalConvertFromHTML,
  ContentState
} from "draft-js";
import {
  convertToHTML as toHTML,
  convertFromHTML as fromHTML
} from "draft-convert";

export const convertToHTML = toHTML({
  blockToHTML: block => {
    // if (block.type === 'PARAGRAPH') {
    //   return <p />;
    // }
    if (block.type === "code-block") {
      return <pre />;
    }
    if (block.type === "body") {
      return block.text;
    }
    console.log("block", block);
  },
  entityToHTML: (entity, originalText) => {
    if (entity.type === "LINK") {
      return <a href={entity.data.url}>{originalText}</a>;
    }
    if (entity.type === "IMAGE") {
      return <img src={entity.data.src} alt={entity.data.alt || null} />;
    }
    if (entity.type === "VIDEO") {
      return (
        <video src={entity.data.src} poster={entity.data.poster || null} />
      );
    }
    if (entity.type === "mention") {
      return (
        <a href={entity.data.mention.link} className="h-card u-url">
          {originalText}
        </a>
      );
    }
    console.log("entity", entity, originalText);
    return originalText;
  }
});

export const convertFromHTML = html => {
  const blocksFromHTML = originalConvertFromHTML(html);
  const state = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap
  );
  return state;
};

/*
export const convertFromHTML = fromHTML({
  htmlToEntity: (nodeName, node, createEntity) => {
    if (nodeName === "a" && node.className.includes("h-card")) {
      // Create mention
      return createEntity("mention", "IMMUTABLE", {
        mention: {
          link: node.href,
          name: node.innerText
        }
      });
    } else if (nodeName === "a") {
      // Create link
      return createEntity("LINK", "MUTABLE", { url: node.href });
    }
    if (nodeName === "img") {
      console.log("Creating image");
      return createEntity("IMAGE", "IMMUTABLE", {
        src: node.getAttribute("src"),
        alt: node.getAttribute("alt") || null
      });
    }
    if (nodeName === "video") {
      return createEntity("VIDEO", "IMMUTABLE", {
        src: node.getAttribute("src"),
        poster: node.getAttribute("poster") || null
      });
    }
  },
  // textToEntity: (text, createEntity) => {
  //   const result = [];
  //   text.replace(/\@(\w+)/g, (match, name, offset) => {
  //     const entityKey = createEntity("AT-MENTION", "IMMUTABLE", { name });
  //     result.push({
  //       entity: entityKey,
  //       offset,
  //       length: match.length,
  //       result: match
  //     });
  //   });
  //   return result;
  // },
  htmlToBlock: (nodeName, node) => {
    console.log("unknown node", nodeName);
  }
});
*/
