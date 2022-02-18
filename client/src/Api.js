import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const insertPost = (payload) => api.post(`/post`, payload);
export const getAllPosts = () => api.get(`/posts`);
export const updatePostbyId = (id, payload) => api.put(`post/${id}`, payload);
export const deletePostById = (id) => api.delete(`/post/${id}`);
export const getPostById = (id) => api.get(`/post/${id}`);

const apis = {
  insertPost,
  getAllPosts,
  updatePostbyId,
  deletePostById,
  getPostById,
};

export default apis;
