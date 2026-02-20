import Link from "next/link";
import { Container, Stack, Icon, Divider } from "@/components/ui";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
  { href: "/life", label: "Life" },
];

interface FooterProps {
  profile?: {
    username: string;
  } | null;
}

export default function Footer({ profile }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 text-zinc-400">
      <Container size="xl" className="py-12">
        <Stack gap="lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Brand */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                {profile?.username || "Portfolio"}
              </h3>
              <p className="text-sm text-zinc-500 max-w-xs">
                Curated thoughts & digital experiences. Exploring the intersection of minimal aesthetics and high-performance engineering.
              </p>
            </div>

            {/* Links */}
            <Stack direction="row" gap="lg" className="flex-wrap">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </div>

          <Divider className="border-zinc-800" />

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-zinc-500">
              © {currentYear} {profile?.username || "Portfolio"}. All rights reserved.
            </p>
            <Stack direction="row" gap="sm" align="center">
              <span className="text-xs text-zinc-500">Built with</span>
              <Icon name="heart" size="xs" className="text-red-500" />
              <span className="text-xs text-zinc-500">Next.js & Supabase</span>
            </Stack>
          </div>
        </Stack>
      </Container>
    </footer>
  );
}
