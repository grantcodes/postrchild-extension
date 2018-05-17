function removeText(el) {
  let parent = el.cloneNode(true);
  for (let i = 0; i < parent.childNodes.length; i++) {
    const child = parent.childNodes[i];
    if (child.nodeType === 3) {
      parent.removeChild(child);
    }
  }

  const children = parent.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    parent.replaceChild(removeText(child), child);
  }
  return parent;
}

export default removeText;
