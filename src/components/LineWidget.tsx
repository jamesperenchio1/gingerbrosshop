import { MessageCircle } from 'lucide-react';

export default function LineWidget() {
  return (
    <a
      href="https://line.me/R/ti/p/@852nqred?ts=07142313&oat_content=url"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#06C755] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      title="Chat with us on Line"
    >
      <MessageCircle className="w-7 h-7 fill-white" />
    </a>
  );
}
