import React, { useState } from 'react';
import postImg from '../../../../images/post_img.png';
import timelineImg from '../../../../images/timeline_img.png';
import reactImg1 from '../../../../images/react_img1.png';
import reactImg2 from '../../../../images/react_img2.png';
import reactImg3 from '../../../../images/react_img3.png';
import reactImg4 from '../../../../images/react_img4.png';
import reactImg5 from '../../../../images/react_img5.png';
import commentImg from '../../../../images/comment_img.png';
import txtImg from '../../../../images/txt_img.png';
import User from '../../../types';
import { addComment, likeToggle, privacyChange, updatePost, deletePost } from '../../../services/api';
import axios from 'axios';
import CommentBox from './CommentBox';
import PostComments from './PostComments';
import LikersModal from './LikersModal';
type Post = {
    id: number | string;
    author: User;
    content?: string;
    image_url?: string[];
    created_at: string;
    likes_count?: number;
    comments_count?: number;
    shares_count?: number;
    liked?: boolean;
    is_public?: boolean;
    comments?: any[];
};

const PostCard: React.FC<{ posts: Post[], setPosts: React.Dispatch<React.SetStateAction<Post[]>>, currentUser: User | null }> = ({ posts, setPosts, currentUser }) => {
    const [openPostId, setOpenPostId] = useState<number | string | null>(null);
    const [editingPostId, setEditingPostId] = useState<number | string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [openComment, setOpenComment] = useState(false);
    const [likersModal, setLikersModal] = useState<{ type: 'post' | 'comment'; id: number | string } | null>(null);

    const toggleDropdown = (e: React.MouseEvent, postId: number | string) => {
        e.stopPropagation();
        setOpenPostId(prev => (prev === postId ? null : postId));
    };
    const toggleComment = () => {
        setOpenComment(prev => !prev);
    };

    const handleLikeToggle = async (likeable_id: number | string, likeable_type: 'post' | 'comment') => {
        console.log('Toggling like for', likeable_type, 'with ID', likeable_id);
        const res = await likeToggle(likeable_id, likeable_type);
        if (likeable_type === 'post') { // post
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === likeable_id
                        ? {
                            ...post,
                            liked: res?.liked,
                            likes_count: res?.likes_count,
                        }
                        : post
                )
            );
        } else if (likeable_type === 'comment') {
            setPosts(prevPosts =>
                prevPosts.map(post => ({
                    ...post,
                    comments: post.comments?.map(comment =>
                        comment.id === likeable_id
                            ? {
                                ...comment,
                                liked: res?.liked,
                                likes_count: res?.likes_count,
                            }
                            : comment
                    )
                }))
            );
        }

    };

    const handlePrivacyChange = async (postId: number | string, value: string) => {

        const res = await privacyChange(postId.toString(), value === "1");
        const updatedPost = res?.data ?? res.data?.data ?? null;
        if (updatedPost) {
            setPosts(prev =>
                prev.map(post =>
                    post.id === updatedPost.id
                        ? { ...post, is_public: updatedPost.is_public } // only update public
                        : post
                )
            );
        }


    }

    const handleAddComment = async (postId: number | string, comment: string) => {
        try {
            const res = await addComment(postId.toString(), comment);
        }
        catch (err) {
            console.error('add comment failed', err);
        }
    };

    const handleDeletePost = async (postId: number | string) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await deletePost(postId.toString());
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err) {
            console.error('delete post failed', err);
        }
    };

    const handleEditPost = (post: Post) => {
        setEditingPostId(post.id);
        setEditContent(post.content || "");
        setOpenPostId(null);
    };

    const handleSaveEdit = async (postId: number | string) => {
        try {
            const res = await updatePost(postId.toString(), { body: editContent });
            const updatedPost = res?.data ?? res;
            if (updatedPost) {
                setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: updatedPost.body || updatedPost.content } : p));
                setEditingPostId(null);
            }
        } catch (err) {
            console.error('update post failed', err);
        }
    };

    return (
        <>
            {posts.map((post) => (
                <div key={post.id} className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
                    <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                        <div className="_feed_inner_timeline_post_top">
                            <div className="_feed_inner_timeline_post_box">
                                <div className="_feed_inner_timeline_post_box_image">
                                    <img src={postImg} alt="" className="_post_img" />
                                </div>
                                <div className="_feed_inner_timeline_post_box_txt">
                                    <h4 className="_feed_inner_timeline_post_box_title">{post?.author?.name}</h4>
                                    <p className="_feed_inner_timeline_post_box_para">{post.created_at} . 
                                        {/* <a href="#0">Public</a> */}
                                       
                                        {currentUser?.id === post?.author?.id ? (
                                        <select
                                            value={post?.is_public ? "1" : "0"} // "1" = public, "0" = private
                                            onChange={(e) => handlePrivacyChange(post.id, e.target.value)}
                                            className="_feed_inner_timeline_post_box_para"
                                        >
                                            <option value="1">Public</option>
                                            <option value="0">Private</option>
                                        </select>
                                        ) : (
                                        <span className="_feed_inner_timeline_post_box_para">
                                            {post.is_public ? "Public" : "Private"}
                                        </span>
                                        )}
                                    </p>

                                </div>
                            </div>
                            <div className="_feed_inner_timeline_post_box_dropdown">
                                <div className="_feed_timeline_post_dropdown">
                                    <button
                                        id={`_timeline_show_drop_btn_${post.id}`}
                                        onClick={(e) => toggleDropdown(e, post.id)}
                                        className="_feed_timeline_post_dropdown_link"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                                            <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                                            <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                                            <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                                        </svg>
                                    </button>
                                </div>
                                {/*Dropdown*/}
                                <div id={`_timeline_drop_${post.id}`} className={`_feed_timeline_dropdown _timeline_dropdown ${openPostId === post.id ? 'show' : ''}`}>
                                    <ul className="_feed_timeline_dropdown_list">
                                        <li className="_feed_timeline_dropdown_item">
                                            <a href="#0" className="_feed_timeline_dropdown_link">
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                                                        <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M14.25 15.75L9 12l-5.25 3.75v-12a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v12z" />
                                                    </svg>
                                                </span>
                                                Save Post
                                            </a>
                                        </li>
                                        {currentUser?.id === post?.author?.id && (
                                            <>
                                                <li className="_feed_timeline_dropdown_item">
                                                    <a href="#0" className="_feed_timeline_dropdown_link" onClick={(e) => { e.preventDefault(); handleEditPost(post); }}>
                                                        <span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                                                                <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M8.25 3H3a1.5 1.5 0 00-1.5 1.5V15A1.5 1.5 0 003 16.5h10.5A1.5 1.5 0 0015 15V9.75" />
                                                                <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M13.875 1.875a1.591 1.591 0 112.25 2.25L9 11.25 6 12l.75-3 7.125-7.125z" />
                                                            </svg>
                                                        </span>
                                                        Edit Post
                                                    </a>
                                                </li>
                                                <li className="_feed_timeline_dropdown_item">
                                                    <a href="#0" className="_feed_timeline_dropdown_link" onClick={(e) => { e.preventDefault(); handleDeletePost(post.id); }}>
                                                        <span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                                                                <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5zM7.5 8.25v4.5M10.5 8.25v4.5" />
                                                            </svg>
                                                        </span>
                                                        Delete Post
                                                    </a>
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {editingPostId === post.id ? (
                            <div className="_edit_post_area">
                                <textarea
                                    className="form-control"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={3}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn btn-primary" onClick={() => handleSaveEdit(post.id)}>Save</button>
                                    <button className="btn btn-secondary" onClick={() => setEditingPostId(null)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <h4 className="_feed_inner_timeline_post_title">{post?.content}</h4>
                        )}
                        {post?.image_url?.map((img_url: string, index: number) => (
                            <div className="_feed_inner_timeline_image" key={index}>
                                <img src={img_url} alt="" className="_time_img" />
                            </div>
                        ))}
                    </div>
                    <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
                        <div className="_feed_inner_timeline_total_reacts_image">
                            <img src={reactImg1} alt="Image" className="_react_img1" />
                            <img src={reactImg2} alt="Image" className="_react_img" />
                            <img src={reactImg3} alt="Image" className="_react_img _rect_img_mbl_none" />
                            <img src={reactImg4} alt="Image" className="_react_img _rect_img_mbl_none" />
                            <img src={reactImg5} alt="Image" className="_react_img _rect_img_mbl_none" />
                            <p
                                className="_feed_inner_timeline_total_reacts_para"
                                onClick={() => setLikersModal({ type: 'post', id: post.id })}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                title="See who liked this"
                            >
                                {post?.likes_count}
                            </p>
                        </div>

                        <div className="_feed_inner_timeline_total_reacts_txt">
                            <p className="_feed_inner_timeline_total_reacts_para1">
                                <a href="#0"><span>{post?.comments_count}</span> Comment</a>
                            </p>
                            <p className="_feed_inner_timeline_total_reacts_para2"><span>{post?.shares_count ?? 0}</span> Share</p>
                        </div>
                    </div>
                    <div className="_feed_inner_timeline_reaction">
                        <button
                            className="_feed_inner_timeline_reaction_emoji _feed_reaction _feed_reaction_active"
                            onClick={() => handleLikeToggle(post?.id, 'post')}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                cursor: "pointer",
                                background: "transparent",
                                border: "none",
                                color: post?.liked ? "red" : "gray",
                                fontWeight: "bold",
                                fontSize: "14px",
                            }}
                        >
                            {/* Heart SVG */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill={post?.liked ? "red" : "none"}
                                stroke={post?.liked ? "red" : "gray"}
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 21C12 21 7 16.6 5 12.5 3 8.5 5.5 5 8 5c1.5 0 3 1 4 2 1-1 2.5-2 4-2 2.5 0 5 3.5 3 7.5-2 4.1-7 8.5-7 8.5z"
                                />
                            </svg>
                            Love

                        </button>
                        <button
                            className="_feed_inner_timeline_reaction_comment _feed_reaction"
                            onClick={toggleComment}
                        >
                            <span className="_feed_inner_timeline_reaction_link"> <span>
                                <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                                    <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                                    <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
                                </svg>
                                Comment
                            </span>
                            </span>
                        </button>
                        <button className="_feed_inner_timeline_reaction_share _feed_reaction">
                            <span className="_feed_inner_timeline_reaction_link"> <span>
                                <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
                                    <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
                                </svg>
                                Share
                            </span>
                            </span>
                        </button>
                    </div>

                    <PostComments post={post} openMainCommentBox={openComment} />
                </div>
            ))}
            {likersModal && (
                <LikersModal
                    type={likersModal.type}
                    id={likersModal.id}
                    onClose={() => setLikersModal(null)}
                />
            )}
        </>
    );
};

export default PostCard;

// Render likers modal at root level (outside the map)
// Note: LikersModal is rendered inside PostCard below
