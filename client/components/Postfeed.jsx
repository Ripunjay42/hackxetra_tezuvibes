import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, MessageCircle, Trash2, X, Plus } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

const CreatePostForm = ({ onSubmit, error }) => {
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    content: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPost({ ...newPost, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewPost({ ...newPost, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(newPost);
    if (success) {
      setNewPost({ title: "", description: "", content: "", image: null });
      setImagePreview(null);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <h2 className="text-2xl font-bold">Create New Post</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            required
          />
          <Input
            placeholder="Description"
            value={newPost.description}
            onChange={(e) =>
              setNewPost({ ...newPost, description: e.target.value })
            }
            required
          />
          <Textarea
            placeholder="Content"
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
            required
          />
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              {imagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRemoveImage}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {imagePreview && (
              <div className="relative w-full h-48">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="submit">Create Post</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PostFeed = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState({});
  const [loading, setLoading] = useState(true);
  const [likeInProgress, setLikeInProgress] = useState({}); // Add this to prevent multiple clicks

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/posts");
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (newPost) => {
    try {
      if (!newPost.title || !newPost.description || !newPost.content) {
        setError("Please fill in all required fields");
        return false;
      }

      const formData = new FormData();
      formData.append("title", newPost.title);
      formData.append("description", newPost.description);
      formData.append("content", newPost.content);
      formData.append("userId", userId);

      if (newPost.image) {
        formData.append("image", newPost.image);
      }

      const response = await axios.post(
        "http://localhost:3001/api/posts",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setPosts((prevPosts) => [response.data, ...prevPosts]);
      setError("");
      setShowCreatePost(false);
      return true;
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.response?.data?.error || "Failed to create post");
      return false;
    }
  };

  const handleLike = async (postId) => {
    if (likeInProgress[postId]) return;

    try {
      setLikeInProgress((prev) => ({ ...prev, [postId]: true }));

      const currentPost = posts.find((p) => p.id === postId);
      const hasLiked = currentPost.Like?.some(
        (like) => like.userId === parseInt(userId)
      );

      // Create a new like object for optimistic update
      const newLike = {
        userId: parseInt(userId),
        postId: postId,
        id: Date.now(), // temporary ID for optimistic update
      };

      // Optimistically update the UI with animation
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            if (hasLiked) {
              return {
                ...post,
                Like: post.Like.filter(
                  (like) => like.userId !== parseInt(userId)
                ),
              };
            } else {
              return {
                ...post,
                Like: [...(post.Like || []), newLike],
              };
            }
          }
          return post;
        })
      );

      // Make API call
      if (hasLiked) {
        await axios.delete(`http://localhost:3001/api/posts/${postId}/like`, {
          data: { userId },
        });
      } else {
        const response = await axios.post(
          `http://localhost:3001/api/posts/${postId}/like`,
          {
            userId,
          }
        );

        // Update the like with the actual server response if needed
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId && !hasLiked) {
              return {
                ...post,
                Like: post.Like.map((like) =>
                  like.id === newLike.id ? response.data : like
                ),
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setError("Failed to update like");

      // Revert the optimistic update without refreshing
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const hasLiked = post.Like?.some(
              (like) => like.userId === parseInt(userId)
            );
            if (hasLiked) {
              return {
                ...post,
                Like: [...(post.Like || []), { userId: parseInt(userId) }],
              };
            } else {
              return {
                ...post,
                Like: post.Like.filter(
                  (like) => like.userId !== parseInt(userId)
                ),
              };
            }
          }
          return post;
        })
      );
    } finally {
      setLikeInProgress((prev) => ({ ...prev, [postId]: false }));
    }
  };
  const handleComment = async (postId) => {
    try {
      if (!newComments[postId]?.trim()) {
        setError("Comment cannot be empty");
        return;
      }

      const newComment = {
        id: Date.now(),
        comment: newComments[postId],
        userId: parseInt(userId),
        user: { firstName: "You" },
        createdAt: new Date().toISOString(),
      };

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              Comment: [...(post.Comment || []), newComment],
            };
          }
          return post;
        })
      );

      setNewComments({ ...newComments, [postId]: "" });

      const response = await axios.post(
        `http://localhost:3001/api/posts/${postId}/comment`,
        {
          userId,
          comment: newComment.comment,
        }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              Comment: post.Comment.map((comment) =>
                comment.id === newComment.id ? response.data : comment
              ),
            };
          }
          return post;
        })
      );
    } catch (error) {
      setError("Failed to add comment");
      fetchPosts();
    }
  };

  const toggleComments = (postId) => {
    setComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="w-100  mx-auto ">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError("")}
              className="h-8 px-2 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <Button
          onClick={() => setShowCreatePost(!showCreatePost)}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          {showCreatePost ? "Hide Create Post" : "Create New Post"}
        </Button>
      </div>

      {showCreatePost && (
        <CreatePostForm onSubmit={handleCreatePost} error={error} />
      )}
      <ScrollArea className="h-[78vh] w-100">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center p-4">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center p-4">No posts yet</div>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    <p className="text-sm text-gray-500">
                      By {post.user?.username} on{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{post.description}</p>
                  {post.imageUrl && (
                    <div className="my-4">
                      <img
                        src={`http://localhost:3001${post.imageUrl}`}
                        alt={post.title}
                        className="rounded-lg max-h-96 w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                  )}
                  <p className="mt-2">{post.content}</p>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="flex space-x-4">
                    <Button
                      variant="ghost"
                      onClick={() => handleLike(post.id)}
                      disabled={likeInProgress[post.id]}
                      className={`flex items-center space-x-2 transition-all duration-200 ${
                        likeInProgress[post.id] ? "opacity-50" : ""
                      }`}
                    >
                      <Heart
                        className={`transition-all duration-200 ${
                          post.Like?.some(
                            (like) => like.userId === parseInt(userId)
                          )
                            ? "fill-red-500 stroke-red-500 scale-110"
                            : "scale-100"
                        }`}
                      />
                      <span className="transition-all duration-200">
                        {post.Like?.length || 0}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center space-x-2"
                    >
                      <MessageCircle />
                      <span>{post.Comment?.length || 0}</span>
                    </Button>
                  </div>

                  {comments[post.id] && (
                    <div className="w-full space-y-4">
                      {post.Comment?.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-gray-50 p-2 rounded"
                        >
                          <p className="text-sm font-semibold">
                            {comment.user?.firstName} {comment.user?.lastName}
                          </p>
                          <p>{comment.comment}</p>
                        </div>
                      ))}
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a comment..."
                          value={newComments[post.id] || ""}
                          onChange={(e) =>
                            setNewComments({
                              ...newComments,
                              [post.id]: e.target.value,
                            })
                          }
                        />
                        <Button onClick={() => handleComment(post.id)}>
                          Comment
                        </Button>
                      </div>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PostFeed;
