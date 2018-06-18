import axios from 'axios';

const defaultReject = () => {};

export const postRequest = (url, data, callback) => {
  const headers = {"Content-Type": "application/json"};
  const opts = {'headers': headers};
  axios.post(url, data, opts).then(callback).catch();
}

export const getRequest = (url, data, callback) => {
	axios.get(url, {params: {data: data}}).then(callback).catch();
}
