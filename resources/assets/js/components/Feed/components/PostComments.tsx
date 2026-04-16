import React, { useState, useEffect } from "react";
import txtImg from "../../../../images/txt_img.png";
import commentImg from "../../../../images/comment_img.png";
import { addComment, getParentComments, getReplies, likeToggle } from "../../../services/api";
import LikersModal from "./LikersModal";
import { message } from "antd";

const PostComments = ({ post, openMainCommentBox }) => {
  const [comments, setComments] = useState([]); // top-level comments
  const [lastParentId, setLastParentId] = useState(null);
  const [loadingParents, setLoadingParents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [likersModal, setLikersModal] = useState<{ type: 'comment'; id: number | string } | null>(null);

const handleLikeToggle = async (likeable_id, likeable_type) => {
  if (likeLoading[likeable_id]) return;
  setLikeLoading(prev => ({ ...prev, [likeable_id]: true }));
  try {
    const res = await likeToggle(likeable_id, likeable_type);
    if (!res) return;

    // Recursive function to update nested comments/replies
    const updateComments = (commentsList) => {
      return commentsList.map((comment) => {
        if (comment.id === likeable_id && likeable_type === "comment") {
          return { ...comment, liked: res.liked, likes_count: res.likes_count };
        } else if (comment.replies?.length) {
          return { ...comment, replies: updateComments(comment.replies) };
        }
        return comment;
      });
    };

    setComments((prev) => updateComments(prev));
  } catch (err) {
    message.error("Failed to like comment");
  } finally {
    setLikeLoading(prev => ({ ...prev, [likeable_id]: false }));
  }
};


  const fetchParents = async () => {
    if (loadingParents) return;
    setLoadingParents(true);
    try {
      const res = await getParentComments(post.id, lastParentId);
      if (res && res.data?.length) {
        setComments((prev) => {
          const unique = res.data.filter(c => !prev.some(p => p.id === c.id));
          return [...prev, ...unique];
        });
        setLastParentId(res.data[res.data.length - 1].id);
      }
    } catch (err) {
      message.error("Failed to load comments");
    } finally {
      setLoadingParents(false);
    }
  };

  useEffect(() => {
    if (openMainCommentBox && comments.length === 0) {
      setLastParentId(null);
      fetchParents();
    }
  }, [post.id, openMainCommentBox]);

  const handleCommentSubmit = async (postId, parentId, body, file = null) => {
    if (!body.trim() && !file) return;
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await addComment(postId, body, parentId, file);
      if (!res) return;

      if (!parentId) {
        setComments((prev) => [{ ...res.data, replies: [], showReplies: false, lastReplyId: null }, ...prev]);
      } else {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), res.data] }
              : c
          )
        );
      }
      message.success("Comment posted!");
      return res;
    } catch (err) {
      message.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMainSubmit = async (e) => {
    e.preventDefault();
    await handleCommentSubmit(post.id, null, newComment, file);
    setNewComment("");
    setFile(null);
  };

  return (
    <div className="_timline_comment_main">
      {openMainCommentBox && (
        <div className="_feed_inner_timeline_cooment_area">
          <div className="_feed_inner_comment_box">
            <form className="_feed_inner_comment_box_form" onSubmit={handleMainSubmit}>
              <div className="_feed_inner_comment_box_content">
                <div className="_feed_inner_comment_box_content_image">
                  <img src={commentImg} alt="" className="_comment_img" />
                </div>
                <div className="_feed_inner_comment_box_content_txt">
                  <textarea
                    className="form-control _comment_textarea"
                    placeholder="Write a comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>
              </div>
              <div className="_feed_inner_comment_box_icon">
                <label className="_feed_inner_comment_box_icon_btn" style={{ cursor: "pointer" }}>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  📎
                </label>
                <button type="submit" className="_feed_inner_comment_box_icon_btn" disabled={submitting}>
                  {submitting ? "..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          postId={post.id}
          handleLikeToggle={handleLikeToggle}
          handleCommentSubmit={handleCommentSubmit}
          onOpenLikers={(id) => setLikersModal({ type: 'comment', id })}
        />
      ))}

      {lastParentId && (
        <button disabled={loadingParents} onClick={fetchParents}>
          {loadingParents ? "Loading..." : "Load more comments"}
        </button>
      )}

      {/* Who liked modal for comments */}
      {likersModal && (
        <LikersModal
          type="comment"
          id={likersModal.id}
          onClose={() => setLikersModal(null)}
        />
      )}
    </div>
  );
};

const Comment = ({ comment, postId, handleCommentSubmit, handleLikeToggle, onOpenLikers }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [lastReplyId, setLastReplyId] = useState(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const fetchReplies = async (loadMore = false) => {
    if (loadingReplies) return;
    setLoadingReplies(true);

    const topLevelId = comment.parent_id ?? comment.id;
    // console.log("Fetching replies for topLevelId:", topLevelId, "lastReplyId:", lastReplyId);
    const res = await getReplies(topLevelId, lastReplyId); // backend should support lastReplyId for pagination

    if (res && res.data?.length) {
      setReplies((prev) => {
        const unique = res.data.filter(r => !prev.some(p => p.id === r.id));
        return loadMore ? [...prev, ...unique] : unique;
      });
      setLastReplyId(res.data[res.data.length - 1].id);
    }

    setLoadingReplies(false);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    const topLevelId = comment.parent_id ?? comment.id;

    try {
      const res = await handleCommentSubmit(postId, topLevelId, replyText);
      if (res) {
        setReplyText("");
        setShowReplyBox(false);
        setReplies((prev) => [...prev, res.data]);
        setLastReplyId(res.data.id);
      }
    } catch (err) {
       // Error handled in handleCommentSubmit
    }
  };

  return (
    <div className="_comment_main" style={{ marginLeft: comment.parent_id ? 20 : 0 }}>
      <div className="_comment_image">
        <img src={txtImg} alt="" className="_comment_img1" />
      </div>
      <div className="_comment_area">
        <div className="_comment_details">
          <div className="_comment_details_top">
            <h4 className="_comment_name_title">{comment?.author?.name}</h4>
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text">{comment?.body}</p>
          </div>
          <div className="_comment_reply">
            <ul className="_comment_reply_list">
              <li>
                {comment.likes_count > 0 && (
                  <span
                    onClick={() => onOpenLikers(comment.id)}
                    style={{ cursor: 'pointer', color: '#e25', marginRight: 4 }}
                    title="See who liked this"
                  >
                    ❤️ {comment.likes_count}
                  </span>
                )}
                <span
                  onClick={() => handleLikeToggle(comment.id, "comment")}
                  style={{ color: comment.liked ? "blue" : "black", cursor: "pointer" }}
                >
                  Like.
                </span>
              </li>
              <li>
                <span onClick={() => setShowReplyBox(!showReplyBox)}>Reply.</span>
              </li>
              {!comment.parent_id && !showReplies && (
                <li>
                  <span
                    onClick={async () => {
                      setShowReplies(true);
                      fetchReplies();
                    }}
                    style={{ cursor: "pointer", color: "#1580b2" }}
                  >
                    View Replies
                  </span>
                </li>
              )}
            </ul>
          </div>

          {showReplyBox && (
            <div className="_feed_inner_comment_box" style={{ marginTop: "10px" }}>
              <form className="_feed_inner_comment_box_form" onSubmit={handleReplySubmit}>
                <textarea
                  className="form-control _comment_textarea"
                  placeholder="Write a reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button type="submit" disabled={replyText.trim().length === 0}>Post</button>
              </form>
            </div>
          )}

          {/* Replies List */}
          {showReplies &&
            replies.map((r) => (
              <Comment
                key={r.id}
                comment={r}
                postId={postId}
                handleCommentSubmit={handleCommentSubmit}
                handleLikeToggle={handleLikeToggle}
                onOpenLikers={onOpenLikers}
              />
            ))}

          {/* Load more replies button */}
          {showReplies && lastReplyId && (
            <button onClick={() => fetchReplies(true)} disabled={loadingReplies}>
              {loadingReplies ? "Loading..." : "Load more replies"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostComments;
