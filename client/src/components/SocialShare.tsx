/**
 * Componente de Compartilhamento Social
 * Permite compartilhar conteúdo em redes sociais
 */

import { useState } from "react";
import { Share2, Twitter, Linkedin, Facebook, Link, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SocialShareProps {
  url?: string;
  title: string;
  description?: string;
  variant?: "button" | "icon";
}

export function SocialShare({ url, title, description, variant = "button" }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description || title)}%0A%0A${encodeURIComponent(shareUrl)}`,
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  
  const openShare = (platform: keyof typeof shareLinks) => {
    if (platform === "email") {
      window.location.href = shareLinks[platform];
    } else {
      window.open(shareLinks[platform], "_blank", "width=600,height=400");
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        {variant === "button" ? (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        ) : (
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-1">
          <button
            onClick={() => openShare("twitter")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
          >
            <Twitter className="h-4 w-4 text-[#1DA1F2]" />
            Twitter / X
          </button>
          <button
            onClick={() => openShare("linkedin")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
          >
            <Linkedin className="h-4 w-4 text-[#0A66C2]" />
            LinkedIn
          </button>
          <button
            onClick={() => openShare("facebook")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
          >
            <Facebook className="h-4 w-4 text-[#1877F2]" />
            Facebook
          </button>
          <button
            onClick={() => openShare("email")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email
          </button>
          <div className="border-t my-2" />
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Link copiado!
              </>
            ) : (
              <>
                <Link className="h-4 w-4 text-muted-foreground" />
                Copiar link
              </>
            )}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
