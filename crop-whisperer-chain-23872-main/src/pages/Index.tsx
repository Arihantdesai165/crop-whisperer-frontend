import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sprout, TrendingUp, MessageCircle, Shield, Leaf, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farm.jpg";

// 🟢 Import i18n hook
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="h-16 w-16 text-accent" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
            {t("hero.title")}
          </h1>

          <p className="text-xl md:text-2xl text-primary-foreground/95 mb-8 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="xl"
              variant="outline"
              className="bg-background/90 backdrop-blur-sm"
            >
              <a href="http://localhost/login/main.php?page=login">
                {t("hero.explore")}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("features.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="p-8 hover:shadow-elevated transition-shadow">
            <div className="bg-gradient-earth rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Sprout className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t("features.crop.title")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("features.crop.desc")}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t("features.crop.p1")}</li>
              <li>• {t("features.crop.p2")}</li>
              <li>• {t("features.crop.p3")}</li>
              <li>• {t("features.crop.p4")}</li>
            </ul>
          </Card>

          {/* Feature 2 */}
          <Card className="p-8 hover:shadow-elevated transition-shadow">
            <div className="bg-gradient-harvest rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <TrendingUp className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t("features.yield.title")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("features.yield.desc")}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t("features.yield.p1")}</li>
              <li>• {t("features.yield.p2")}</li>
              <li>• {t("features.yield.p3")}</li>
              <li>• {t("features.yield.p4")}</li>
            </ul>
          </Card>

          {/* Feature 3 */}
          <Card className="p-8 hover:shadow-elevated transition-shadow">
            <div className="bg-gradient-sky rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <MessageCircle className="h-8 w-8 text-info-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t("features.ai.title")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("features.ai.desc")}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t("features.ai.p1")}</li>
              <li>• {t("features.ai.p2")}</li>
              <li>• {t("features.ai.p3")}</li>
              <li>• {t("features.ai.p4")}</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-6">
              {t("trust.title")}
            </h2>
            <p className="text-lg text-center text-muted-foreground mb-8">
              {t("trust.desc")}
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground">{t("trust.i1")}</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">{t("trust.i2")}</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">
                  {t("trust.i3v")}
                </div>
                <p className="text-muted-foreground">{t("trust.i3")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Droplets className="h-16 w-16 text-info mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t("cta.desc")}
          </p>
          <Button asChild size="xl" variant="earth">
            <Link to="/auth">{t("cta.button")}</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 AgriTrust — {t("footer.text")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
