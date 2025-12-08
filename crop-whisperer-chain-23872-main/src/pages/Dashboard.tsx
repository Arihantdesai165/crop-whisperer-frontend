import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, TrendingUp, MessageCircle, User, FileText, Shield, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();

  // Logout
  const handleLogout = () => {
    window.location.href = "http://localhost/login/main.php?action=logout";
  };

  return (
    <div className="min-h-screen bg-background">

      {/* HEADER */}
      <header className="bg-gradient-earth text-primary-foreground shadow-medium">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <Leaf className="h-6 w-6" />
            {t("dashboard.title")}
          </Link>

          {/* LOGOUT BUTTON */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-red-500/20 border-red-500 text-red-600 hover:bg-red-500/30"
          >
            {t("dashboard.logout")}
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8">

        {/* WELCOME SECTION */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("dashboard.welcome")}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.subtitle")}
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">

          {/* CROPS RECOMMENDATION */}
          <Card className="hover:shadow-elevated transition-all cursor-pointer group">
            <CardHeader>
              <div className="bg-gradient-earth rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sprout className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>{t("dashboard.recommendCrops")}</CardTitle>
              <CardDescription>{t("dashboard.recommendCropsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/crop-recommendation">
                <Button className="w-full" variant="earth">
                  {t("dashboard.startRecommendation")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* PREDICT YIELD */}
          <Card className="hover:shadow-elevated transition-all cursor-pointer group">
            <CardHeader>
              <div className="bg-gradient-harvest rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>{t("dashboard.predictYield")}</CardTitle>
              <CardDescription>{t("dashboard.predictYieldDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/crop-yield-prediction">
                <Button className="w-full" variant="harvest">
                  {t("dashboard.predictYieldBtn")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI ASSISTANT */}
          <Card className="hover:shadow-elevated transition-all cursor-pointer group">
            <CardHeader>
              <div className="bg-gradient-sky rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6 text-info-foreground" />
              </div>
              <CardTitle>{t("dashboard.aiAssistant")}</CardTitle>
              <CardDescription>{t("dashboard.aiAssistantDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/ai-assistant">
                <Button className="w-full" variant="info">
                  {t("dashboard.startChat")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* SECONDARY ACTIONS */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* PROFILE */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{t("dashboard.myProfile")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("dashboard.myProfileDesc")}
              </p>
              <Link to="/profile">
                <Button variant="outline" className="w-full">
                  {t("dashboard.viewProfile")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* RECORDS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{t("dashboard.myRecords")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("dashboard.myRecordsDesc")}
              </p>
              <Button variant="outline" className="w-full">
                {t("dashboard.viewRecords")}
              </Button>
            </CardContent>
          </Card>

          {/* BLOCKCHAIN */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{t("dashboard.blockchain")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("dashboard.blockchainDesc")}
              </p>
              <Button variant="outline" className="w-full">
                {t("dashboard.viewLedger")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* INFO BANNER */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  {t("dashboard.transparencyTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.transparencyDesc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default Dashboard;
