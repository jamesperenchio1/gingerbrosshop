import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Gingerbros - Thai Craft Ginger Beverages",
    template: "%s | Gingerbros",
  },
  description:
    "Handcrafted ginger beverages from Thailand. Bold flavors, natural ingredients, brewed with love.",
  openGraph: {
    title: "Gingerbros - Thai Craft Ginger Beverages",
    description:
      "Handcrafted ginger beverages from Thailand. Bold flavors, natural ingredients, brewed with love.",
    siteName: "Gingerbros",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-dark font-sans antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
