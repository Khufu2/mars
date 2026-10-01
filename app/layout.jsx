import './globals.css';

export const metadata = {
  title: 'Wizrac',
  description: 'Business management and investment operating system'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f1ecdf'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}