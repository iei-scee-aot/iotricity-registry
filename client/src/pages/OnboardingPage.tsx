import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../lib/auth-client";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    collegeEmail: "",
    rollNumber: "",
    semester: 1,
    department: "",
    phoneNumber: "",
    teamBuildingProgram: false,
    readCodeOfConduct: false,
    joinedDiscord: false,
  });

  useEffect(() => {
    if (!isSessionPending && !session) {
      navigate("/");
      return;
    }

    if (session?.user?.email) {
      checkExistingUser();
    }
  }, [session, isSessionPending]);

  const checkExistingUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/team-members/${session?.user?.email}`
      );
      if (response.data) {
        // User already exists, check if they have a team
        navigate("/team");
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // User doesn't exist, stay on onboarding page
        setLoading(false);
      } else {
        setError("Failed to check user status. Please try again.");
        setLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/team-members`, {
        ...formData,
        name: session?.user?.name,
        googleEmail: session?.user?.email,
        googleProfilePicture: session?.user?.image,
        semester: Number(formData.semester),
      });
      navigate("/team");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save profile. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isSessionPending || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-card p-8 rounded-2xl shadow-lg border border-border">
      <h2 className="text-2xl font-bold text-card-foreground mb-6">Complete Your Profile</h2>
      <p className="text-muted-foreground mb-8">
        We need a few more details from you to get started. These details are required for institutional verification.
      </p>

      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              College Email (@aot.edu.in)
            </label>
            <input
              type="email"
              name="collegeEmail"
              required
              placeholder="example@aot.edu.in"
              value={formData.collegeEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Roll Number (Starts with 169)
            </label>
            <input
              type="text"
              name="rollNumber"
              required
              placeholder="16900122..."
              value={formData.rollNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Semester
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s} className="bg-background">
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              required
              placeholder="CSE, ECE, IT, etc."
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            required
            placeholder="10-digit mobile number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
          />
        </div>

        <div className="space-y-4 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="teamBuildingProgram"
              checked={formData.teamBuildingProgram}
              onChange={handleChange}
              className="w-4 h-4 text-primary border-input rounded focus:ring-primary bg-background"
            />
            <span className="text-sm text-muted-foreground">I am interested in the Team Building Program</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="readCodeOfConduct"
              required
              checked={formData.readCodeOfConduct}
              onChange={handleChange}
              className="w-4 h-4 text-primary border-input rounded focus:ring-primary bg-background"
            />
            <span className="text-sm text-muted-foreground">I have read and agree to the Code of Conduct</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="joinedDiscord"
              required
              checked={formData.joinedDiscord}
              onChange={handleChange}
              className="w-4 h-4 text-primary border-input rounded focus:ring-primary bg-background"
            />
            <span className="text-sm text-muted-foreground">I have joined the official Discord server</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
          Complete Registration
        </button>
      </form>
    </div>
  );
}
