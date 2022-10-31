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
      const titleEl = item.querySelector('title');
      const descriptionEl = item.querySelector('description');
      const linkEl = item.querySelector('link');
      const guidEl = item.querySelector('guid');

      const title = titleEl.textContent;
      const description = descriptionEl.textContent;
      const link = linkEl.textContent;
      const guid = guidEl.textContent;

      return {
        title, description, link, guid,
      };
    });

  return posts;
};

export default (contents) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(contents, 'text/xml');
  const currentFeed = extractFeed(doc);
  const currentPosts = extractPosts(doc);

  return { currentFeed, currentPosts };
};
