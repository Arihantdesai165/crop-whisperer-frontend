import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, ArrowLeft, Loader2, Download } from "lucide-react";
import { Link } from "react-router-dom";

interface Profile {
  full_name: string;
  phone_number: string | null;
  farm_location: string | null;
  farm_size_acres: number | null;
  primary_crops: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchProfile();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          farm_location: profile.farm_location,
          farm_size_acres: profile.farm_size_acres,
          primary_crops: profile.primary_crops,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDownloadPDF = () => {
    if (!profile) return;
    
    try {
      generateProfilePDF(profile);
      toast({
        title: "Success",
        description: "Profile PDF downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>My Profile</CardTitle>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              )}
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancel
                </Button>
              )}
              <Button onClick={handleLogout} variant="destructive">
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile?.full_name || ""}
                  onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile?.phone_number || ""}
                  onChange={(e) => setProfile(prev => prev ? {...prev, phone_number: e.target.value} : null)}
                  disabled={!isEditing}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Farm Location</Label>
                <Input
                  id="location"
                  value={profile?.farm_location || ""}
                  onChange={(e) => setProfile(prev => prev ? {...prev, farm_location: e.target.value} : null)}
                  disabled={!isEditing}
                  placeholder="City, State"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmSize">Farm Size (acres)</Label>
                <Input
                  id="farmSize"
                  type="number"
                  step="0.01"
                  value={profile?.farm_size_acres || ""}
                  onChange={(e) => setProfile(prev => prev ? {...prev, farm_size_acres: parseFloat(e.target.value) || null} : null)}
                  disabled={!isEditing}
                  placeholder="e.g., 5.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crops">Primary Crops</Label>
                <Input
                  id="crops"
                  value={profile?.primary_crops || ""}
                  onChange={(e) => setProfile(prev => prev ? {...prev, primary_crops: e.target.value} : null)}
                  disabled={!isEditing}
                  placeholder="e.g., Rice, Wheat, Cotton"
                />
              </div>

              {isEditing && (
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
