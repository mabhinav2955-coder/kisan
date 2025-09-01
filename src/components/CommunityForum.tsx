import React, { useState } from 'react';
import { Users, MessageCircle, ThumbsUp, Clock, X, Send, Image } from 'lucide-react';

interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  category: string;
  image?: string;
}

interface CommunityForumProps {
  isOpen: boolean;
  onClose: () => void;
}

const forumPosts: ForumPost[] = [
  {
    id: '1',
    author: 'രാമൻ നായർ (Raman Nair)',
    avatar: '',
    title: 'Brown spots on rice leaves - need help',
    content: 'I noticed brown spots appearing on my rice crop leaves. The weather has been humid lately. Any suggestions for treatment?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 12,
    replies: 8,
    category: 'Pest Management',
    image: ''
  },
  {
    id: '2',
    author: 'സുധ കുമാരി (Sudha Kumari)',
    avatar: '',
    title: 'Best time for coconut harvesting?',
    content: 'When is the optimal time to harvest coconuts in Kottayam district? My trees are 8 years old.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likes: 18,
    replies: 15,
    category: 'Crop Management'
  },
  {
    id: '3',
    author: 'അജയ് കുമാർ (Ajay Kumar)',
    avatar: '',
    title: 'Organic fertilizer success story',
    content: 'Switched to organic fertilizers this season and seeing amazing results! Happy to share my experience.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes: 25,
    replies: 12,
    category: 'Success Stories',
    image: ''
  }
];

export default function CommunityForum({ isOpen, onClose }: CommunityForumProps) {
  const [newPost, setNewPost] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  const handleSubmitPost = () => {
    if (newPost.trim()) {
      // In a real app, this would submit to backend
      alert('Post submitted successfully!');
      setNewPost('');
      setShowNewPost(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Farmer Community</h3>
              <p className="text-sm text-gray-600">Connect with fellow farmers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* New Post Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowNewPost(!showNewPost)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors"
            >
              Share your farming experience or ask a question...
            </button>
          </div>

          {/* New Post Form */}
          {showNewPost && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind? Share your farming experience..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-green-600 transition-colors">
                  <Image className="h-4 w-4" />
                  <span className="text-sm">Add Photo</span>
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowNewPost(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPost}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Forum Posts */}
          <div className="space-y-4">
            {forumPosts.map((post) => (
              <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center shadow-sm">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{post.author}</h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {post.category}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <h5 className="font-semibold text-gray-900 mb-2">{post.title}</h5>
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <button className="flex items-center space-x-1 hover:text-green-600 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.likes} likes</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.replies} replies</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}