import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Leaf, ArrowLeft, Loader2, TrendingUp, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { generateCropRecommendationPDF } from "@/utils/pdfGenerator";
import { useTranslation } from "react-i18next";

interface RecommendationResult {
  recommendations: Array<{
    cropName: string;
    confidence: number;
    reasoning: string;
    expectedYield: string;
    marketDemand: string;
    riskLevel: string;
  }>;
  summary: string;
}

const CropRecommendation = () => {
  const { t, i18n } = useTranslation(); // ← ADDED i18n HERE

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const [formData, setFormData] = useState({
    soilType: "",
    soilPH: "",
    area: "",
    waterAccess: "",
    previousCrops: "",
    season: "",
    budget: "",
    marketPreference: "",
    location: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = awaitfetch(`${import.meta.env.VITE_BACKEND_URL}/api/voice-assistant`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lang: i18n.language   // ← SEND SELECTED LANGUAGE TO BACKEND
        })
      });

      const data = await response.json();
      if (!data || data.error) {
        throw new Error(data?.error || "Failed to get recommendations");
      }

      setResult(data.recommendation);
      toast.success(t("cropRec.success"));

    } catch (error: any) {
      toast.error(t("cropRec.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    try {
      generateCropRecommendationPDF(formData, result);
      toast.success(t("cropRec.pdfSuccess"));
    } catch {
      toast.error(t("cropRec.pdfError"));
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="bg-gradient-earth text-primary-foreground shadow-medium">
        <div className="container mx-auto px-4 py-6 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Leaf className="h-6 w-6" />
            {t("cropRec.title")}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Form */}
        <Card className="shadow-elevated mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t("cropRec.farmDetails")}</CardTitle>
            <CardDescription>{t("cropRec.farmDesc")}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">

                {/* Soil Type */}
                <div className="space-y-2">
                  <Label>{t("cropRec.soilType")} *</Label>
                  <Select value={formData.soilType} onValueChange={(v) => handleInputChange("soilType", v)}>
                    <SelectTrigger><SelectValue placeholder={t("cropRec.selectSoil")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandy">{t("cropRec.soil.sandy")}</SelectItem>
                      <SelectItem value="clay">{t("cropRec.soil.clay")}</SelectItem>
                      <SelectItem value="loamy">{t("cropRec.soil.loamy")}</SelectItem>
                      <SelectItem value="silt">{t("cropRec.soil.silt")}</SelectItem>
                      <SelectItem value="peaty">{t("cropRec.soil.peaty")}</SelectItem>
                      <SelectItem value="chalky">{t("cropRec.soil.chalky")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Soil PH */}
                <div className="space-y-2">
                  <Label>{t("cropRec.soilPH")}</Label>
                  <Input type="number"
                    value={formData.soilPH}
                    onChange={(e) => handleInputChange("soilPH", e.target.value)}
                    placeholder={t("cropRec.examplePH")} />
                </div>

                {/* Area */}
                <div className="space-y-2">
                  <Label>{t("cropRec.area")} *</Label>
                  <Input type="number"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)} />
                </div>

                {/* Water Access */}
                <div className="space-y-2">
                  <Label>{t("cropRec.waterAccess")} *</Label>
                  <Select value={formData.waterAccess} onValueChange={(v) => handleInputChange("waterAccess", v)}>
                    <SelectTrigger><SelectValue placeholder={t("cropRec.selectWater")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abundant">{t("cropRec.water.abundant")}</SelectItem>
                      <SelectItem value="moderate">{t("cropRec.water.moderate")}</SelectItem>
                      <SelectItem value="limited">{t("cropRec.water.limited")}</SelectItem>
                      <SelectItem value="drip">{t("cropRec.water.drip")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Season */}
                <div className="space-y-2">
                  <Label>{t("cropRec.season")} *</Label>
                  <Select value={formData.season} onValueChange={(v) => handleInputChange("season", v)}>
                    <SelectTrigger><SelectValue placeholder={t("cropRec.selectSeason")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kharif">{t("cropRec.seasons.kharif")}</SelectItem>
                      <SelectItem value="rabi">{t("cropRec.seasons.rabi")}</SelectItem>
                      <SelectItem value="zaid">{t("cropRec.seasons.zaid")}</SelectItem>
                      <SelectItem value="year-round">{t("cropRec.seasons.yearRound")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <Label>{t("cropRec.budget")} *</Label>
                  <Input type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange("budget", e.target.value)} />
                </div>

                {/* Market Preference */}
                <div className="space-y-2">
                  <Label>{t("cropRec.marketPreference")} *</Label>
                  <Select value={formData.marketPreference} onValueChange={(v) => handleInputChange("marketPreference", v)}>
                    <SelectTrigger><SelectValue placeholder={t("cropRec.selectPreference")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">{t("cropRec.market.local")}</SelectItem>
                      <SelectItem value="export">{t("cropRec.market.export")}</SelectItem>
                      <SelectItem value="organic">{t("cropRec.market.organic")}</SelectItem>
                      <SelectItem value="contract">{t("cropRec.market.contract")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>{t("cropRec.location")} *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)} />
                </div>
              </div>

              {/* Previous Crops */}
              <div className="space-y-2">
                <Label>{t("cropRec.previousCrops")}</Label>
                <Textarea
                  value={formData.previousCrops}
                  onChange={(e) => handleInputChange("previousCrops", e.target.value)}
                  placeholder={t("cropRec.previousExample")} />
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading
                  ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("cropRec.analyzing")}</>
                  : t("cropRec.getRecommendations")}
              </Button>

            </form>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {result && (
          <Card className="shadow-elevated">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-success" />
                <CardTitle className="text-2xl">{t("cropRec.yourRecommendations")}</CardTitle>
              </div>
              <CardDescription>{result.summary}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {result.recommendations.map((rec, i) => (
                <Card key={i} className="border-primary/20 border-2">
                  <CardHeader>
                    <CardTitle className="text-primary text-xl">{rec.cropName}</CardTitle>
                    <p className="text-sm">{t("cropRec.confidence")}: {rec.confidence}%</p>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <p><strong>{t("cropRec.why")}:</strong> {rec.reasoning}</p>
                    <p><strong>{t("cropRec.expectedYield")}:</strong> {rec.expectedYield}</p>
                    <p><strong>{t("cropRec.marketDemand")}:</strong> {rec.marketDemand}</p>
                    <p><strong>{t("cropRec.riskLevel")}:</strong> {rec.riskLevel}</p>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={handleDownloadPDF} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> {t("cropRec.downloadPDF")}
              </Button>
            </CardContent>

          </Card>
        )}

      </main>
    </div>
  );
};

export default CropRecommendation;
