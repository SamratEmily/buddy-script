
import React, { useState, useEffect, useRef } from 'react';
import '../../../css/bootstrap.min.css';
import '../../../css/common.css';
import '../../../css/main.css';
import '../../../css/responsive.css';

// Image imports 
import LeftSidebar from './components/LeftSidebar';
import Stories from './components/Stories';
import CreatePostCard from './components/CreatePostCard';
import PostCard from './components/PostCard';
import RightSidebar from './components/RightSidebar';
import Navbar from './components/Navbar';
import LayoutChange from './components/LayoutChange';

import { User } from '../../types';
import { createPost, getPosts, likeToggle } from '../../services/api';
import { Post } from '../../types';

const Feed: React.FC<{ currentUser: User | null; onLogout: () => void }> = ({ currentUser, onLogout }) => {


    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = async (lastId?: number | string) => {
        if (loading || (!hasMore && lastId)) return;
        setLoading(true);
        try {
            const fetched = await getPosts(currentUser ?? undefined, lastId);
            if (fetched && fetched.length > 0) {
                if (lastId) {
                    setPosts(prev => [...prev, ...fetched]);
                } else {
                    setPosts(fetched);
                }
                if (fetched.length < 10) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.warn('failed to load posts', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [currentUser]);

    const handleLoadMore = () => {
        const lastId = posts[posts.length - 1]?.id;
        if (lastId) fetchPosts(lastId);
    };

    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!hasMore || loading) return;
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                handleLoadMore();
            }
        }, { threshold: 1.0 });

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, posts.length]);

    const handleCreatePost = async (content: string, files?: File[], isPublic: boolean = true) => {
        if (!currentUser) {
            console.warn('No current user, cannot create post');
            return null;
        }
        try {
            const res = await createPost(content, files, isPublic);
            const newPost = res?.data ?? res;
            if (newPost && newPost.id) {
                setPosts(prev => [newPost, ...prev]);
            }
            return res;
        } catch (err) {
            console.error('create post failed', err);
            return null;
        }
    };

    return (
        <div className="_layout _layout_main_wrapper">
            {/* Switching Btn Start */}
            <LayoutChange />
            {/* Switching Btn End */}

            <div className="_main_layout">
                {/* Navbar */}

                <Navbar
                    currentUser={currentUser}
                    onLogout={onLogout}
                />

                {/* Main Layout Structure */}
                <div className="container _custom_container">
                    <div className="_layout_inner_wrap">
                        <div className="row">
                            {/* Left Sidebar */}
                            <LeftSidebar />
                            {/* Left Sidebar end*/}

                            {/* Layout Middle */}
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                <div className="_layout_middle_wrap">
                                    <div className="_layout_middle_inner">
                                        {/* story area */}
                                        <Stories />

                                        {/*create post area*/}
                                        <CreatePostCard
                                            currentUser={currentUser}
                                            handleSubmit={handleCreatePost}
                                        />


                                        {/* feed area */}
                                        {/* feed area */}
                                        {posts.length > 0 && (
                                            <PostCard
                                                currentUser={currentUser}
                                                posts={posts}
                                                setPosts={setPosts}
                                            />
                                        )}

                                        {/* Load More Button */}
                                        <div 
                                            ref={loadMoreRef}
                                            className="text-center p-4"
                                            style={{ cursor: 'pointer', minHeight: '100px' }}
                                            onClick={handleLoadMore}
                                        >
                                            {loading ? (
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            ) : (
                                                hasMore ? (
                                                    <button className="btn btn-outline-primary px-4 rounded-pill shadow-sm">
                                                        Load More Posts
                                                    </button>
                                                ) : (
                                                    <p className="text-muted small">You've reached the end of the feed.</p>
                                                )
                                            )}
                                        </div>

                                        {posts.length === 0 && !loading && (
                                             <p className="text-center mt-5 text-muted">No posts available to display.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Layout Middle  end*/}

                            {/* Right Sidebar */}
                            <RightSidebar />
                            {/* Right Sidebar end*/}
                        </div>

                    </div>
                </div>
            </div>
            {/* Main Layout Structure end*/}
        </div>
    );
};

export default Feed;
