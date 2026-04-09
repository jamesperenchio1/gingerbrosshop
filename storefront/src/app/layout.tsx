import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Playfair_Display, Nunito } from "next/font/google"
import "styles/globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-playfair",
})

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-nunito",
})

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
    <html lang="en" data-mode="light" className={`${playfair.variable} ${nunito.variable}`}>
      <body className="bg-background text-dark font-sans antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
