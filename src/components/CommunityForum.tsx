import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Heart, 
  ThumbsDown, 
  Reply, 
  Plus, 
  Search, 
  Filter, 
  Image as ImageIcon,
  Send,
  MoreVertical,
  Trash2,
  Pin,
  Eye,
  Calendar,
  MapPin
} from 'lucide-react';
import BackButton from './BackButton';
import { CommunityPost, ImageFile } from '../types/farmer';

interface CommunityForumProps {
  onBack?: () => void;
}

export default function CommunityForum({ onBack }: CommunityForumProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    tags: '',
    images: [] as File[]
  });
  const [newReply, setNewReply] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'general', label: 'General Discussion' },
    { value: 'crop-care', label: 'Crop Care' },
    { value: 'pest-control', label: 'Pest Control' },
    { value: 'weather', label: 'Weather' },
    { value: 'market', label: 'Market Prices' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'schemes', label: 'Government Schemes' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Mock API call - in production, this would call the actual backend
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          author: {
            id: '1',
            name: 'രാജേഷ് കുമാർ',
            village: 'കുമരകം',
            district: 'കോട്ടയം'
          },
          title: 'Rice cultivation tips for this season',
          content: 'Sharing some effective techniques I\'ve learned for better rice yield this monsoon season. The key is proper water management and timely fertilization.',
          images: [],
          category: 'crop-care',
          tags: ['rice', 'cultivation', 'monsoon'],
          likes: [
            { user: '2', createdAt: new Date().toISOString() },
            { user: '3', createdAt: new Date().toISOString() }
          ],
          dislikes: [],
          replies: [
            {
              id: '1',
              author: {
                id: '2',
                name: 'സുധ കുമാരി',
                village: 'വയനാട്',
                district: 'വയനാട്'
              },
              content: 'Great tips! I\'ve been following similar practices and seeing good results.',
              images: [],
              likes: [{ user: '1', createdAt: new Date().toISOString() }],
              dislikes: [],
              isDeleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          isDeleted: false,
          isPinned: false,
          viewCount: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userLiked: false,
          userDisliked: false
        },
        {
          id: '2',
          author: {
            id: '3',
            name: 'അജയ് കുമാർ',
            village: 'ആലപ്പുഴ',
            district: 'ആലപ്പുഴ'
          },
          title: 'Coconut price update from local market',
          content: 'Current coconut prices in Alappuzha market: Small nuts ₹12, Medium nuts ₹15, Large nuts ₹18. Prices seem stable this week.',
          images: [],
          category: 'market',
          tags: ['coconut', 'price', 'alappuzha'],
          likes: [
            { user: '1', createdAt: new Date().toISOString() },
            { user: '2', createdAt: new Date().toISOString() },
            { user: '4', createdAt: new Date().toISOString() }
          ],
          dislikes: [],
          replies: [],
          isDeleted: false,
          isPinned: true,
          viewCount: 28,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userLiked: true,
          userDisliked: false
        }
      ];

      // Filter posts based on search and category
      let filteredPosts = mockPosts;
      
      if (selectedCategory !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === selectedCategory);
      }
      
      if (searchTerm) {
        filteredPosts = filteredPosts.filter(post => 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return false;
      }
      return true;
    });

    setNewPost(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles].slice(0, 3) // Max 3 images
    }));

    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setNewPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) {
      alert('Please fill in title and content');
      return;
    }

    try {
      // Mock API call - in production, this would call the actual backend
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      formData.append('category', newPost.category);
      formData.append('tags', newPost.tags);
      
      newPost.images.forEach(image => {
        formData.append('images', image);
      });

      // Reset form
      setNewPost({
        title: '',
        content: '',
        category: 'general',
        tags: '',
        images: []
      });
      setPreviewUrls([]);
      setShowCreatePost(false);
      
      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      // Mock API call
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Update local state
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const isCurrentlyLiked = post.userLiked;
            const isCurrentlyDisliked = post.userDisliked;
            
            return {
              ...post,
              userLiked: !isCurrentlyLiked,
              userDisliked: false,
              likes: isCurrentlyLiked 
                ? post.likes.filter(like => like.user !== 'current-user')
                : [...post.likes, { user: 'current-user', createdAt: new Date().toISOString() }],
              dislikes: isCurrentlyDisliked 
                ? post.dislikes.filter(dislike => dislike.user !== 'current-user')
                : post.dislikes
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDislike = async (postId: string) => {
    try {
      // Mock API call
      const response = await fetch(`/api/posts/${postId}/dislike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Update local state
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const isCurrentlyLiked = post.userLiked;
            const isCurrentlyDisliked = post.userDisliked;
            
            return {
              ...post,
              userLiked: false,
              userDisliked: !isCurrentlyDisliked,
              likes: isCurrentlyLiked 
                ? post.likes.filter(like => like.user !== 'current-user')
                : post.likes,
              dislikes: isCurrentlyDisliked 
                ? post.dislikes.filter(dislike => dislike.user !== 'current-user')
                : [...post.dislikes, { user: 'current-user', createdAt: new Date().toISOString() }]
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error disliking post:', error);
    }
  };

  const handleReply = async (postId: string) => {
    if (!newReply.trim()) return;

    try {
      // Mock API call
      const response = await fetch(`/api/posts/${postId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newReply })
      });

      if (response.ok) {
        setNewReply('');
        fetchPosts(); // Refresh posts to get updated replies
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {onBack && <BackButton onBack={onBack} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Forum</h2>
          <p className="text-gray-600">Connect with fellow farmers and share knowledge</p>
        </div>
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">
                      {post.author.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{post.author.village}, {post.author.district}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {post.isPinned && (
                    <Pin className="h-4 w-4 text-green-600" />
                  )}
                  <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                <p className="text-gray-700">{post.content}</p>
                
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Images */}
              {post.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                      post.userLiked 
                        ? 'bg-red-100 text-red-600' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.userLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes.length}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDislike(post.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                      post.userDisliked 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>{post.dislikes.length}</span>
                  </button>

                  <button
                    onClick={() => setSelectedPost(post)}
                    className="flex items-center space-x-1 px-3 py-1 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                  >
                    <Reply className="h-4 w-4" />
                    <span>{post.replies.length}</span>
                  </button>

                  <div className="flex items-center space-x-1 text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>{post.viewCount}</span>
                  </div>
                </div>

                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  {categories.find(c => c.value === post.category)?.label}
                </span>
              </div>

              {/* Replies */}
              {selectedPost?.id === post.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h5 className="font-medium text-gray-900 mb-3">Replies ({post.replies.length})</h5>
                  
                  {/* Existing Replies */}
                  <div className="space-y-3 mb-4">
                    {post.replies.map(reply => (
                      <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{reply.author.name}</span>
                          <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Reply */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleReply(post.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter post title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={4}
                    placeholder="Share your thoughts..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., rice, cultivation, tips"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images (max 3)
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span>Add Images</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}