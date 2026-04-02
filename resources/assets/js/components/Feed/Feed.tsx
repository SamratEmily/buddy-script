
import React, { useState, useEffect } from 'react';
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

    useEffect(() => {

        let mounted = true;
        (async () => {
            try {
                const lastId = posts[posts.length - 1]?.id;
                const fetched = await getPosts(currentUser ?? undefined, lastId);
                if (mounted) setPosts(fetched ?? []);
            } catch (err) {
                console.warn('failed to load posts', err);
            }
        })();
        return () => { mounted = false };
    }, [currentUser]);

    const handleCreatePost = async (content: string, files?: File[]) => {
        if (!currentUser) {
            console.warn('No current user, cannot create post');
            return null;
        }
        try {
            // Pass content and File[] directly to createPost; createPost will use FormData if files exist
            const res = await createPost(content, files);
            // If API returns created post, prepend it for immediate UI feedback
            const newPost = res?.data ?? res ?? { body: content, user: currentUser };
            setPosts(prev => [newPost, ...prev]);
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
                                        {posts.length > 0 && (
                                            <PostCard
                                                currentUser={currentUser}
                                                posts={posts}
                                                setPosts={setPosts}

                                            />
                                        )}
                                        {posts.length === 0 && (
                                            <p>No posts to display.</p>
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
