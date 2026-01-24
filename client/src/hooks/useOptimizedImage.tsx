/**
 * Hook de otimização de imagens com lazy loading e WebP fallback
 * Implementa best practices de performance para carregamento de imagens
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseOptimizedImageOptions {
  src: string;
  placeholder?: string;
  threshold?: number;
  rootMargin?: string;
}

interface UseOptimizedImageReturn {
  imageSrc: string;
  isLoaded: boolean;
  isInView: boolean;
  imgRef: React.RefObject<HTMLImageElement>;
  onLoad: () => void;
  onError: () => void;
}

// Placeholder SVG base64 para loading
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2FycmVnYW5kby4uLjwvdGV4dD48L3N2Zz4=';

/**
 * Hook para lazy loading de imagens com Intersection Observer
 */
export function useOptimizedImage({
  src,
  placeholder = DEFAULT_PLACEHOLDER,
  threshold = 0.1,
  rootMargin = '50px',
}: UseOptimizedImageOptions): UseOptimizedImageReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer para detectar quando a imagem entra na viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Carregar imagem quando entrar na viewport
  useEffect(() => {
    if (isInView && src) {
      // Verificar suporte a WebP e tentar carregar versão otimizada
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      // Preload da imagem
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        // Fallback para imagem original se WebP falhar
        setImageSrc(src);
        setIsLoaded(true);
      };
      
      // Tentar WebP primeiro se disponível
      if (supportsWebP()) {
        img.src = webpSrc;
      } else {
        img.src = src;
      }
    }
  }, [isInView, src]);

  const onLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const onError = useCallback(() => {
    setImageSrc(placeholder);
    setIsLoaded(true);
  }, [placeholder]);

  return {
    imageSrc,
    isLoaded,
    isInView,
    imgRef: imgRef as React.RefObject<HTMLImageElement>,
    onLoad,
    onError,
  };
}

// Cache para verificação de suporte a WebP
let webpSupport: boolean | null = null;

function supportsWebP(): boolean {
  if (webpSupport !== null) return webpSupport;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  return webpSupport;
}

/**
 * Componente de imagem otimizada com lazy loading
 */
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  placeholder,
  className = '',
  wrapperClassName = '',
  ...props
}: OptimizedImageProps) {
  const { imageSrc, isLoaded, imgRef, onLoad, onError } = useOptimizedImage({
    src,
    placeholder,
  });

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading="lazy"
        decoding="async"
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
}

/**
 * Hook para prefetch de imagens críticas
 */
export function usePrefetchImages(urls: string[]) {
  useEffect(() => {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup não necessário para prefetch links
    };
  }, [urls]);
}

/**
 * Gera srcset para imagens responsivas
 */
export function generateSrcSet(
  baseSrc: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  const extension = baseSrc.split('.').pop() || 'jpg';
  const basePath = baseSrc.replace(`.${extension}`, '');
  
  return sizes
    .map((size) => `${basePath}-${size}w.${extension} ${size}w`)
    .join(', ');
}

export default useOptimizedImage;
