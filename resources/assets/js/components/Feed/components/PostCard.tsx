import React, { useState } from 'react';
import { message } from 'antd';
import postImg from '../../../../images/post_img.png';
import reactImg1 from '../../../../images/react_img1.png';
import reactImg2 from '../../../../images/react_img2.png';
import reactImg3 from '../../../../images/react_img3.png';
import reactImg4 from '../../../../images/react_img4.png';
import reactImg5 from '../../../../images/react_img5.png';
import User from '../../../types';
import { likeToggle, privacyChange, updatePost, deletePost } from '../../../services/api';
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

const PostItem: React.FC<{ 
    post: Post, 
    currentUser: User | null, 
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>,
    onOpenLikers: (type: 'post' | 'comment', id: number | string) => void
}> = ({ post, currentUser, setPosts, onOpenLikers }) => {
    const [openPostId, setOpenPostId] = useState<number | string | null>(null);
    const [editingPostId, setEditingPostId] = useState<number | string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
    const [openComment, setOpenComment] = useState(false);
    const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenPostId(prev => (prev === post.id ? null : post.id));
    };

    const toggleComment = () => setOpenComment(prev => !prev);

    const handleLikeToggle = async (likeable_id: number | string, likeable_type: 'post' | 'comment') => {
        const key = `${likeable_type}-${likeable_id}`;
        if (likeLoading[key]) return;

        setLikeLoading(prev => ({ ...prev, [key]: true }));
        try {
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
        } catch (err) {
            message.error("Failed to update like. Please try again.");
        } finally {
            setLikeLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const handlePrivacyChange = async (postId: number | string, value: string) => {
        try {
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
                message.success("Privacy updated successfully");
            }
        } catch (err) {
            message.error("Failed to update privacy");
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
            message.success("Post deleted successfully");
        } catch (err) {
            message.error("Failed to delete post");
        }
    };

    const handleEditPost = (post: Post) => {
        setEditingPostId(post.id);
        setEditContent(post.content || "");
        setOpenPostId(null);
    };

    const handleSaveEdit = async (postId: number | string) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await updatePost(postId.toString(), { body: editContent });
            const updatedPost = res?.data ?? res;
            if (updatedPost) {
                setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: updatedPost.body || updatedPost.content } : p));
                setEditingPostId(null);
                message.success("Post updated successfully");
            }
        } catch (err) {
            message.error("Failed to update post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
            <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                <div className="_feed_inner_timeline_post_top">
                    <div className="_feed_inner_timeline_post_box">
                        <div className="_feed_inner_timeline_post_box_image">
                            <img src={postImg} alt="" className="_post_img" />
                        </div>
                        <div className="_feed_inner_timeline_post_box_txt">
                            <h4 className="_feed_inner_timeline_post_box_title">{post?.author?.name}</h4>
                            <p className="_feed_inner_timeline_post_box_para">
                                {post.created_at} . 
                                {currentUser?.id === post?.author?.id ? (
                                    <select value={post?.is_public ? "1" : "0"} onChange={(e) => handlePrivacyChange(e.target.value)}>
                                        <option value="1">Public</option>
                                        <option value="0">Private</option>
                                    </select>
                                ) : (
                                    <span>{post.is_public ? "Public" : "Private"}</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="_feed_inner_timeline_post_box_dropdown">
                        <div className="_feed_timeline_post_dropdown">
                            <button onClick={toggleDropdown} className="_feed_timeline_post_dropdown_link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                                    <circle cx="2" cy="2" r="2" fill="#C4C4C4" /><circle cx="2" cy="8" r="2" fill="#C4C4C4" /><circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                                </svg>
                            </button>
                        </div>
                        <div className={`_feed_timeline_dropdown _timeline_dropdown ${openPostId === post.id ? 'show' : ''}`}>
                            <ul className="_feed_timeline_dropdown_list">
                                {currentUser?.id === post?.author?.id && (
                                    <>
                                        <li className="_feed_timeline_dropdown_item">
                                            <a href="#0" className="_feed_timeline_dropdown_link" onClick={(e) => { e.preventDefault(); setEditingPostId(post.id); setEditContent(post.content || ""); setOpenPostId(null); }}>
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
                                            <a href="#0" className="_feed_timeline_dropdown_link" onClick={(e) => { e.preventDefault(); handleDelete(); }}>
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
                        <textarea className="form-control" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '4px', marginBottom: '10px' }} />
                        <div style={{ display: 'flex', gap: '10px' }}><button className="btn btn-primary" onClick={handleSaveEdit}>Save</button><button className="btn btn-secondary" onClick={() => setEditingPostId(null)}>Cancel</button></div>
                    </div>
                ) : (
                    <h4 className="_feed_inner_timeline_post_title">{post?.content}</h4>
                )}
                {post?.image_url?.map((url, idx) => <div className="_feed_inner_timeline_image" key={idx}><img src={url} className="_time_img" /></div>)}
            </div>
            <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
                <div className="_feed_inner_timeline_total_reacts_image">
                    <img src={reactImg1} className="_react_img1" /><img src={reactImg2} className="_react_img" />
                    <img src={reactImg3} alt="Image" className="_react_img _rect_img_mbl_none" />
                    <img src={reactImg4} alt="Image" className="_react_img _rect_img_mbl_none" />
                    <img src={reactImg5} alt="Image" className="_react_img _rect_img_mbl_none" />
                    <p onClick={() => onOpenLikers('post', post.id)} style={{ cursor: 'pointer', userSelect: 'none' }}>{post?.likes_count}</p>
                </div>
                <div className="_feed_inner_timeline_total_reacts_txt">
                    <p className="_feed_inner_timeline_total_reacts_para1"><a href="#0"><span>{post?.comments_count}</span> Comment</a></p>
                    <p className="_feed_inner_timeline_total_reacts_para2"><span>{post?.shares_count ?? 0}</span> Share</p>
                </div>
            </div>
            <div className="_feed_inner_timeline_reaction">
                <button 
                    className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${post.liked ? '_active' : ''}`} 
                    onClick={() => handleLikeToggle(post.id, 'post')}
                    style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", background: "transparent", border: "none", color: post?.liked ? "red" : "gray", fontWeight: "bold", fontSize: "14px" }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill={post?.liked ? "red" : "none"} stroke={post?.liked ? "red" : "gray"} viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21C12 21 7 16.6 5 12.5 3 8.5 5.5 5 8 5c1.5 0 3 1 4 2 1-1 2.5-2 4-2 2.5 0 5 3.5 3 7.5-2 4.1-7 8.5-7 8.5z" /></svg>
                    Love
                </button>
                <button className="_feed_inner_timeline_reaction_comment _feed_reaction" onClick={toggleComment}>
                    <span className="_feed_inner_timeline_reaction_link"> <span>
                        <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                            <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                            <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
                        </svg>
                        Comment
                    </span></span>
                </button>
            </div>
            <PostComments post={post} openMainCommentBox={openComment} />
        </div>
    );
};

const PostCard: React.FC<{ posts: Post[], setPosts: React.Dispatch<React.SetStateAction<Post[]>>, currentUser: User | null }> = ({ posts, setPosts, currentUser }) => {
    const [likersModal, setLikersModal] = useState<{ type: 'post' | 'comment'; id: number | string } | null>(null);

    return (
        <>
            {posts.map((post) => (
                <PostItem 
                    key={post.id} 
                    post={post} 
                    currentUser={currentUser} 
                    setPosts={setPosts} 
                    onOpenLikers={(type, id) => setLikersModal({ type, id })}
                />
            ))}
            {likersModal && <LikersModal type={likersModal.type} id={likersModal.id} onClose={() => setLikersModal(null)} />}
        </>
    );
};

export default PostCard;
