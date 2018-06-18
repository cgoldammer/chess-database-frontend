
const post = (url, data) => new Promise( resolve => () => {'test'});
const get = url => new Promise( resolve => () => {'test'});

const axios = {
  get: get
, post: post
}

export default axios;
