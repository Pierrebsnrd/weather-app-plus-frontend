import "./globals.css";

export const metadata = {
  title: "WeatherApp+ | Météo en temps réel",
  description: "Suivez la météo de vos villes préférées en temps réel. Application météo moderne avec authentification et synchronisation cross-device.",
  keywords: "météo, weather, application météo, prévisions météo, temps réel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
