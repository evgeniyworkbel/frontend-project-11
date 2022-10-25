import axios from 'axios';
import parse from './parser.js';

export default function updatePosts(watchedState, proxyUrl, id, generateIdFunc) {
  return axios.get(proxyUrl)
    .then((response) => response.data.contents)
    .then((content) => {
      const { currentPosts: requestedPosts } = parse(content); // Rename property for "currentPosts"

      if (!requestedPosts) {
        throw new Error('Parser Error');
      }
      return requestedPosts;
    })
    .then((requestedPosts) => {
      const loadedPosts = watchedState.data.posts.filter((post) => post.feedId === id);

      if (requestedPosts.length > loadedPosts.length) {
        const currentPostTitles = new Map(loadedPosts.title);
        const newPosts = requestedPosts.filter((reqPost) => !currentPostTitles[reqPost.title]);
        newPosts.forEach((post) => {
          post.feedId = id; // eslint-disable-line no-param-reassign
          post.id = generateIdFunc(); // eslint-disable-line no-param-reassign
        });
        watchedState.data.posts.push(...newPosts);
      }

      return setTimeout(() => updatePosts(watchedState, proxyUrl, id, generateIdFunc), 5000);
    })
    .catch((e) => {
      console.error(e.message);
      return setTimeout(() => updatePosts(watchedState, proxyUrl, id, generateIdFunc), 5000);
    });
}
