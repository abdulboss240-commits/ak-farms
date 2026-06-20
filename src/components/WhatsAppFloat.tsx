import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/format";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("Hello! I'm interested in your goats.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 end-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-[oklch(0.62_0.16_148)] text-white shadow-warm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
