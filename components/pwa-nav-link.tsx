"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface PwaNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: unknown;
}

export function PwaNavLink({ href, children, className, onClick, ...props }: PwaNavLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
        startTransition(() => {
          router.push(href);
        });
      }}
      {...props}
    >
      {children}
    </a>
  );
}
