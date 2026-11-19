import type { ReactNode } from "react";
import { Link } from "react-router";
import logoSrc from "@/assets/logo-tema-concept.png";
import logoIconSrc from "@/assets/logo-tema-concept-icon.png";
import { useTheme } from "@/contexts/ThemeContext";
export const LOGO_SRC = logoSrc;

type TemaLogoProps = {
  variant?: "header" | "sidebar" | "login" | "footer" | "admin" | "avatar" | "message";
  /** Le PNG original garde le texte blanc pour les fonds sombres. */
  theme?: "light" | "dark";
  className?: string;
  to?: string;
  asLink?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

const markSizes: Record<"header" | "sidebar" | "login" | "footer" | "admin", string> = {
  header: "h-8 w-8",
  sidebar: "h-10 w-10",
  login: "h-12 w-12",
  footer: "h-9 w-9",
  admin: "h-10 w-10",
};

const wordmarkSizes: Record<"header" | "sidebar" | "login" | "footer" | "admin", string> = {
  header: "text-sm",
  sidebar: "text-base",
  login: "text-xl",
  footer: "text-base",
  admin: "text-base",
};

function LogoMark({ sizeClass, className = "" }: { sizeClass: string; className?: string }) {
  return (
    <span className={`inline-flex flex-shrink-0 items-center justify-center ${sizeClass} ${className}`}>
      <img
        src={logoIconSrc}
        alt="Tema Concept"
        className="h-full w-full object-contain"
        draggable={false}
      />
    </span>
  );
}

function LogoBrand({
  variant,
  tone,
  className = "",
}: {
  variant: "header" | "sidebar" | "login" | "footer" | "admin";
  tone: "light" | "dark";
  className?: string;
}) {
  const titleColor = tone === "dark" ? "text-white" : "text-[#0F172A]";
  const conceptColor = tone === "dark" ? "text-[#7DD3FC]" : "text-[#2563EB]";
  const subtitleColor = tone === "dark" ? "text-white/70" : "text-[#64748B]";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark sizeClass={markSizes[variant]} />
      <span className="leading-none">
        <span className={`block font-extrabold uppercase tracking-tight ${wordmarkSizes[variant]}`}>
          <span className={titleColor}>Tema</span>{" "}
          <span className={conceptColor}>Concept</span>
        </span>
        <span className={`mt-1 block text-[10px] font-medium ${subtitleColor}`}>
          Solutions de Référence
        </span>
      </span>
    </span>
  );
}

export default function TemaLogo({
  variant = "header",
  theme: themeProp,
  className = "",
  to = "/",
  asLink = false,
  onClick,
}: TemaLogoProps) {
  const { resolvedTheme } = useTheme();
  const theme = themeProp ?? (resolvedTheme === "dark" ? "dark" : "light");
  let content: ReactNode;

  if (variant === "avatar") {
    content = <LogoMark sizeClass="h-11 w-11 rounded-full" className={className} />;
  } else if (variant === "message") {
    content = <LogoMark sizeClass="h-8 w-8 rounded-full" className={className} />;
  } else {
    content = <LogoBrand variant={variant} tone={theme} className={className} />;
  }

  if (asLink) {
    return (
      <Link to={to} onClick={onClick} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="inline-flex items-center">
        {content}
      </button>
    );
  }

  return content;
}
