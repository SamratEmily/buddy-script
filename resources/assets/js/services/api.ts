import axios from 'axios';
import { authFetch } from '../auth';
import { User, Post, Story } from '../types';

export async function getPosts(_currentUser?: User, lastId) {
  try {
    const url = lastId ? `/posts?last_id=${lastId}` : '/posts';
    const res = await authFetch(url);
    return res.data?.data ?? res.data ?? [];
  } catch (e) {
    console.warn('getPosts failed, returning empty list', e);
    return [];
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const res = await authFetch('/users');
    return res.data?.data ?? res.data ?? [];
  } catch (e) {
    console.warn('getAllUsers failed, returning empty list', e);
    return [];
  }
}

export async function getStories(): Promise<Story[]> {
  try {
    const res = await authFetch('/stories');
    return res.data?.data ?? res.data ?? [];
  } catch (e) {
    console.warn('getStories failed, returning empty list', e);
    return [];
  }
}

export async function createPost(
  contentOrPayload: string | { body?: string; imageUrl?: string; privacy?: string; user?: User; files?: any[] },
  files?: File[],
) {

  try {
    // If caller passed (content: string, files?: File[])
    if (typeof contentOrPayload === 'string') {
      const body = contentOrPayload;
      if (files && files.length) {
        const fd = new FormData();
        fd.append('body', body);
        files.forEach((f) => fd.append('files[]', f));
        const res = await authFetch('/posts', { method: 'post', data: fd });
        return res.data;
      }
      const res = await authFetch('/posts', { method: 'post', data: { body } });
      return res.data;
    }

    // If caller passed a payload object
    const payload = contentOrPayload || {};
    // If payload.files appears to be File objects, send multipart
    if (payload.files && Array.isArray(payload.files) && payload.files.length && payload.files[0] instanceof File) {
      const fd = new FormData();
      fd.append('body', payload.body || '');
      payload.files.forEach((f: File) => fd.append('files[]', f));
      const res = await authFetch('/posts', { method: 'post', data: fd });
      return res.data;
    }

    // Default: send JSON payload
    const res = await authFetch('/posts', { method: 'post', data: payload });
    return res.data;
  } catch (e) {
    console.warn('createPost failed', e);
    return null;
  }
}

export async function toggleLikePost(postId: string, userId: string) {
  try {
    const res = await authFetch(`/posts/${postId}/like`, { method: 'post' });
    return res.data;
  } catch (e) {
    console.warn('toggleLikePost failed (mock)', e);
    return null;
  }
}

export async function privacyChange(postId: string, isPublic: boolean) {
  try {
    const res = await authFetch(`/posts/${postId}/privacy`, { method: 'post', data: { is_public: isPublic } });
    return res.data;
  } catch (e) {
    console.warn('privacyChange failed (mock)', e);
    return null;
  }
}

export async function likeToggle(likeable_id, likeable_type) {
  try {
    const res = await authFetch(`/likes`, { method: 'post', data: { likeable_id: likeable_id, likeable_type: likeable_type } });
    return res.data;
  } catch (e) {
    console.warn('like failed (mock)', e);
    return null;
  }
}

export async function addComment(postId: string, body, parentId = '') {

  try {
    const res = await authFetch(`/posts/${postId}/comments`, { method: 'post', data: { body: body, parent_id: parentId } });
    return res.data;
  } catch (e) {
    console.warn('addComment failed (mock)', e);
    return null;
  }
}

export async function createStory(user: User, imageData: string) {
  try {
    const res = await authFetch('/stories', { method: 'post', data: { image: imageData } });
    return res.data;
  } catch (e) {
    console.warn('createStory failed (mock)', e);
    return null;
  }
}

export const getParentComments = async (postId, lastId = null) => {
  const params = {};
  if (lastId) params.last_id = lastId;

  const response = await authFetch(`/posts/${postId}/comments/parents`, { params });
  return response.data; // array of CommentResource
};

/**
 * Fetch replies for a parent comment with cursor pagination
 * @param {number} commentId
 * @param {number|null} lastId
 */
export const getReplies = async (commentId, lastId = null) => {
  const params = {};
  if (lastId) params.last_id = lastId;

  const response = await authFetch(`/comments/${commentId}/replies`, { params });
  return response.data; // array of CommentResource
};

export default { getPosts, getAllUsers, getStories, createPost, toggleLikePost, addComment, createStory };
