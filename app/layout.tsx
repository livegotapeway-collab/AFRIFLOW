import type { ReactNode } from "react";
import "./globals.css";
export const metadata={title:"AFRIFLOW — Kits numériques africains",description:"Des kits numériques pratiques pour développer votre activité depuis votre téléphone."};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="fr"><body>{children}</body></html>}