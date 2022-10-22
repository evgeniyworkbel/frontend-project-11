const extractFeed = (domTree) => {
  const titleEl = domTree.querySelector('channel > title');
  const descriptionEl = domTree.querySelector('channel > description');

  if (!titleEl || !descriptionEl) {
    return null;
  }

  const title = titleEl.textContent;
  const description = descriptionEl.textContent;

  return { title, description };
};

const extractPosts = (domTree) => {
  const itemEls = domTree.querySelectorAll('channel > item');
  if (!itemEls) {
    return null;
  }

  const posts = Array.from(itemEls)
    .map((item) => {
      const title = item
        .querySelector('title')
        .textContent;
      const link = item
        .querySelector('link')
        .textContent;
      return { title, link };
    });

  return posts;
};

export default (contents) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(contents, 'text/xml');
  const newFeed = extractFeed(doc);
  const newPosts = extractPosts(doc);

  return { newFeed, newPosts };
};
