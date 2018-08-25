import axios from 'axios';

export const postRequest = (url, data, callback) => {
  const headers = {'Content-Type': 'application/json',};
  const opts = {'headers': headers,};
  axios.post(url, data, opts).then(callback).catch();
};

export const getRequest = (url, data, callback) => {
  axios.get(url, {params: {data: data,},}).then(callback).catch();
};

export const getRequestPromise = (url, data) => new Promise((resolve, reject) => {
  axios.get(url, {params: {data: data,},}).then(resolve).catch(reject);
});
