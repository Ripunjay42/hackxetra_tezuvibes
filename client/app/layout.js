import localFont from "next/font/local";
import "./globals.css";



export const metadata = {
  title: "intra university social media",
  description: "intra university social media",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
