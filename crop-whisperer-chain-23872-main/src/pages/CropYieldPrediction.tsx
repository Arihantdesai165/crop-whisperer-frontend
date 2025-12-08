import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Download, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { generateYieldPredictionPDF } from "@/utils/pdfGenerator";
import { useTranslation } from "react-i18next";

interface PredictionResult {
  predictedYield: string;
  estimatedRevenue: string;
  profitEstimate: string;
  costBreakdown: {
    seeds: string;
    fertilizer: string;
    irrigation: string;
    labor: string;
    total: string;
  };
  confidence: number;
  reasoning: string;
  marketPrice: string;
}

const CropYieldPrediction = () => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const [formData, setFormData] = useState({
    seedType: "",
    plotSize: "",
    season: "",
    location: "",
    soilType: "",
    fertilizerPlan: "",
    irrigationPlan: "",
    previousYield: "",
    plantingDate: "",
  });

  // ⭐ CALL BACKEND API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/yield-predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lang: i18n.language,
        }),
      });

      const data = await response.json();

      if (!data || data.error) {
        throw new Error(data?.error || "Failed to generate yield prediction");
      }

      setResult(data.prediction);

      toast({
        title: t("yield.toastSuccessTitle"),
        description: t("yield.toastSuccessDesc"),
      });

    } catch (error: any) {
      toast({
        title: t("yield.toastErrorTitle"),
        description: error?.message || t("yield.toastErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;

    try {
      generateYieldPredictionPDF(formData, result);
      toast({
        title: t("yield.pdfSuccessTitle"),
        description: t("yield.pdfSuccessDesc"),
      });
    } catch {
      toast({
        title: t("yield.pdfErrorTitle"),
        description: t("yield.pdfErrorDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* HEADER */}
      <header className="bg-gradient-earth text-primary-foreground shadow-medium">
        <div className="container mx-auto px-4 py-6 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{t("yield.title")}</h1>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* FORM */}
          <Card>
            <CardHeader>
              <CardTitle>{t("yield.formTitle")}</CardTitle>
              <CardDescription>{t("yield.formDesc")}</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Seed Type */}
                <div className="space-y-2">
                  <Label>{t("yield.seedType")} *</Label>
                  <Input
                    placeholder={t("yield.seedPlaceholder")}
                    value={formData.seedType}
                    onChange={(e) => setFormData({ ...formData, seedType: e.target.value })}
                    required
                  />
                </div>

                {/* Plot Size */}
                <div className="space-y-2">
                  <Label>{t("yield.plotSize")} *</Label>
                  <Input
                    type="number"
                    placeholder={t("yield.plotPlaceholder")}
                    value={formData.plotSize}
                    onChange={(e) => setFormData({ ...formData, plotSize: e.target.value })}
                    required
                  />
                </div>

                {/* Season */}
                <div className="space-y-2">
                  <Label>{t("yield.season")} *</Label>
                  <Select
                    value={formData.season}
                    onValueChange={(value) => setFormData({ ...formData, season: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("yield.selectSeason")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kharif">{t("yield.seasons.kharif")}</SelectItem>
                      <SelectItem value="rabi">{t("yield.seasons.rabi")}</SelectItem>
                      <SelectItem value="zaid">{t("yield.seasons.zaid")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>{t("yield.location")} *</Label>
                  <Input
                    placeholder={t("yield.location")}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                {/* Soil Type */}
                <div className="space-y-2">
                  <Label>{t("yield.soilType")} *</Label>
                  <Select
                    value={formData.soilType}
                    onValueChange={(value) => setFormData({ ...formData, soilType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("yield.selectSoil")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clay">{t("yield.soils.clay")}</SelectItem>
                      <SelectItem value="sandy">{t("yield.soils.sandy")}</SelectItem>
                      <SelectItem value="loamy">{t("yield.soils.loamy")}</SelectItem>
                      <SelectItem value="black">{t("yield.soils.black")}</SelectItem>
                      <SelectItem value="red">{t("yield.soils.red")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fertilizer */}
                <div className="space-y-2">
                  <Label>{t("yield.fertilizer")}</Label>
                  <Textarea
                    value={formData.fertilizerPlan}
                    onChange={(e) => setFormData({ ...formData, fertilizerPlan: e.target.value })}
                  />
                </div>

                {/* Irrigation */}
                <div className="space-y-2">
                  <Label>{t("yield.irrigation")}</Label>
                  <Textarea
                    value={formData.irrigationPlan}
                    onChange={(e) => setFormData({ ...formData, irrigationPlan: e.target.value })}
                  />
                </div>

                {/* Previous Yield */}
                <div className="space-y-2">
                  <Label>{t("yield.prevYield")}</Label>
                  <Input
                    type="number"
                    value={formData.previousYield}
                    onChange={(e) => setFormData({ ...formData, previousYield: e.target.value })}
                  />
                </div>

                {/* Planting Date */}
                <div className="space-y-2">
                  <Label>{t("yield.plantingDate")}</Label>
                  <Input
                    type="date"
                    value={formData.plantingDate}
                    onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("yield.loading")}
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      {t("yield.predictBtn")}
                    </>
                  )}
                </Button>

              </form>
            </CardContent>
          </Card>

          {/* RESULTS */}
          {result && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("yield.resultsTitle")}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                  {/* Predicted Yield */}
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <div className="text-sm">{t("yield.predictedYield")}</div>
                    <div className="text-3xl font-semibold">{result.predictedYield}</div>
                    <div className="text-sm mt-2">
                      {t("yield.confidence")}: {result.confidence}%
                    </div>
                  </div>

                  {/* Revenue + Profit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-success/10 rounded-lg">
                      <div className="text-xs">{t("yield.estimatedRevenue")}</div>
                      <div className="text-xl font-semibold">{result.estimatedRevenue}</div>
                    </div>

                    <div className="p-3 bg-accent/10 rounded-lg">
                      <div className="text-xs">{t("yield.profitEstimate")}</div>
                      <div className="text-xl font-semibold">{result.profitEstimate}</div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div>
                    <h4 className="font-semibold">{t("yield.costBreakdown")}</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>{t("yield.cost.seeds")}:</span>
                        <span>{result.costBreakdown.seeds}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("yield.cost.fertilizer")}:</span>
                        <span>{result.costBreakdown.fertilizer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("yield.cost.irrigation")}:</span>
                        <span>{result.costBreakdown.irrigation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("yield.cost.labor")}:</span>
                        <span>{result.costBreakdown.labor}</span>
                      </div>

                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>{t("yield.cost.total")}:</span>
                        <span>{result.costBreakdown.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Market Price */}
                  <div>
                    <h4 className="font-semibold">{t("yield.marketPrice")}</h4>
                    <p className="text-sm">{result.marketPrice}</p>
                  </div>

                  {/* Analysis */}
                  <div>
                    <h4 className="font-semibold">{t("yield.analysis")}</h4>
                    <p className="text-sm">{result.reasoning}</p>
                  </div>

                  {/* PDF Button */}
                  <Button onClick={handleDownloadPDF} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    {t("yield.downloadPDF")}
                  </Button>

                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default CropYieldPrediction;
