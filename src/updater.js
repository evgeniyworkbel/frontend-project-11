import axios from 'axios';
import parse from './parser.js';

export default function updatePosts(watchedState, proxyUrl, id, generateIdFunc) {
  return axios.get(proxyUrl)
    .then((response) => response.data.contents)
    .then((content) => {
      const { currentPosts: requestedPosts } = parse(content);
      if (!requestedPosts) {
        throw new Error('Parser Error');
      }

      return requestedPosts;
    })
    .then((requestedPosts) => {
      const loadedPosts = watchedState.data.posts.filter((post) => post.feedId === id);
      const loadedPostsGuids = loadedPosts.map((post) => post.guid);
      const coll = new Set(loadedPostsGuids);
      const newPosts = requestedPosts.filter(({ guid }) => !coll.has(guid));

      if (newPosts.length === 0) {
        return;
      }

      newPosts.forEach((post) => {
        post.feedId = id; // eslint-disable-line no-param-reassign
        post.id = generateIdFunc(); // eslint-disable-line no-param-reassign
      });

      watchedState.data.posts.push(...newPosts);
      return newPosts; // eslint-disable-line consistent-return
    })
    .catch((e) => console.error(e.message))
    .finally(() => setTimeout(() => updatePosts(watchedState, proxyUrl, id, generateIdFunc), 5000));
}
