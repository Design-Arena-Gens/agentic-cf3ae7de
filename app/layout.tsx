import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AutoTube Studio',
  description: 'Autonomous agent that scripts, assembles, and uploads videos to YouTube.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="gradient">
        {children}
      </body>
    </html>
  );
}
