// eslint-disable-next-line no-unused-vars
const post = () => new Promise( resolve => () => {'test';});
// eslint-disable-next-line no-unused-vars
const get = () => new Promise( resolve => () => {'test';});

const axios = {
  get: get,
  post: post,
};

export default axios;
