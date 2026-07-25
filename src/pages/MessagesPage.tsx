import * as React from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  Search, 
  ChevronRight, 
  Home,
  ArrowLeft
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMine: boolean;
}

interface ConversationItem {
  id: string;
  userName: string;
  userRole: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export const MessagesPage: React.FC = () => {
  const { messages, sendMessage } = useWorkflow();

  const convList = (messages || []) as unknown as ConversationItem[];

  const [activeConvId, setActiveConvId] = React.useState<string>(convList[0]?.id || 'conv-1');
  const [mobileShowThread, setMobileShowThread] = React.useState(false);
  const [inputText, setInputText] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const activeConv = React.useMemo<ConversationItem | undefined>(() => {
    return convList.find((c) => c.id === activeConvId) || convList[0];
  }, [convList, activeConvId]);

  const filteredConversations = React.useMemo<ConversationItem[]>(() => {
    return convList.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (c.userName && c.userName.toLowerCase().includes(q)) ||
        (c.userRole && c.userRole.toLowerCase().includes(q)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
      );
    });
  }, [convList, searchQuery]);

  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }, 50);
  };

  React.useEffect(() => {
    scrollToBottom(false);
  }, [activeConvId, mobileShowThread]);

  React.useEffect(() => {
    scrollToBottom(true);
  }, [activeConv?.messages?.length]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !activeConvId || isSubmitting) return;

    setIsSubmitting(true);
    sendMessage(activeConvId, trimmed);
    setInputText('');
    scrollToBottom(true);
    setTimeout(() => setIsSubmitting(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs pb-12 select-none relative">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span>Overview</span>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-700 font-bold">Internal Team Messages</span>
      </nav>

      {/* Main Chat Layout Container */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-140px)] min-h-[500px] md:h-[620px]">
        
        {/* Left Side: Conversation List (Visible on desktop or when mobile thread is not active) */}
        <div className={`w-full md:w-[320px] border-r border-gray-200 flex flex-col bg-gray-50/50 ${mobileShowThread ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 border-b border-gray-200 bg-white">
            <h2 className="font-extrabold text-sm text-gray-900 flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-brand-600" /> Team Conversations
            </h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search colleagues..."
                className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-gray-200 rounded bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium text-gray-700"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-150 overflow-y-auto flex-1 scrollbar-thin">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400 italic">No conversations found.</div>
            ) : (
              filteredConversations.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveConvId(c.id);
                    setMobileShowThread(true);
                  }}
                  className={`w-full text-left p-3 flex items-start gap-3 transition-colors cursor-pointer ${activeConvId === c.id ? 'bg-white border-l-4 border-l-brand-600 shadow-sm' : 'hover:bg-gray-100/60'}`}
                >
                  <div className="h-9 w-9 rounded-full bg-brand-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0 border shadow-xs">
                    {c.avatar || (c.userName ? c.userName.slice(0, 2).toUpperCase() : 'UI')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-900 truncate text-[11.5px]">{c.userName}</span>
                      <span className="text-[9.5px] text-gray-400 font-bold shrink-0">{c.timestamp}</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-brand-600 block uppercase tracking-tight">{c.userRole}</span>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">{c.lastMessage}</p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-brand-600 text-white shrink-0">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window (Visible on desktop or when mobile thread is active) */}
        <div className={`flex-1 flex flex-col bg-white ${mobileShowThread ? 'flex' : 'hidden md:flex'}`}>
          {activeConv ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-white shadow-xs">
                <div className="flex items-center gap-3">
                  {/* Back to Conversations Button (Mobile Only) */}
                  <button
                    onClick={() => setMobileShowThread(false)}
                    className="md:hidden flex items-center gap-1 text-gray-600 hover:text-brand-600 font-bold text-xs p-1 rounded hover:bg-gray-100 cursor-pointer"
                    title="Back to Conversations"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-[11px]">Back</span>
                  </button>

                  <div className="h-8 w-8 rounded-full bg-brand-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {activeConv.avatar || (activeConv.userName ? activeConv.userName.slice(0, 2).toUpperCase() : 'UI')}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                      {activeConv.userName}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      {activeConv.userRole} • Active Now
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages Feed */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-gray-50/30 scrollbar-thin">
                {activeConv.messages && activeConv.messages.length > 0 ? (
                  activeConv.messages.map((m: any) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-gray-400 mb-0.5">
                        <span>{m.sender}</span>
                        <span>•</span>
                        <span>{m.time}</span>
                      </div>
                      <div
                        className={`max-w-[82%] sm:max-w-[75%] p-3 rounded-lg text-[11.5px] font-semibold leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                          m.isMine 
                            ? 'bg-brand-700 text-white border border-brand-800 rounded-tr-none shadow-brand-900/10' 
                            : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 italic text-xs">
                    No message history yet. Start the conversation below.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Sticky Input Footer */}
              <form onSubmit={handleSend} className="p-2 sm:p-3 border-t border-gray-200 bg-white flex items-end gap-2 sticky bottom-0 z-10">
                <textarea
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Reply to ${activeConv.userName}... (Shift+Enter for newline)`}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-500 font-medium bg-gray-50 focus:bg-white text-gray-900 resize-none max-h-24 min-h-[38px]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSubmitting}
                  className="px-3.5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <Send className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 italic">
              Select a conversation to open message thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
