import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { fetchFromApi } from "../helpers/api";

export default function OnboardingPage() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await fetchFromApi("/api/team-members", {
        method: "POST",
        body: JSON.stringify({
          name: session.user.name,
          googleEmail: session.user.email,
          googleProfilePicture: session.user.image,
          ...formData,
        }),
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8 bg-zinc-900/50 p-8 rounded-xl border border-zinc-800">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
          <p className="text-zinc-400">Step {step} of 3</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-semibold">Academic Details</h2>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">College Email</label>
                <input
                  required
                  type="email"
                  name="collegeEmail"
                  value={formData.collegeEmail}
                  onChange={handleChange}
                  className="w-full bg-black border border-zinc-800 rounded-md p-2 focus:ring-2 focus:ring-[#9505F7] outline-none"
                  placeholder="yourname@college.edu"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Roll Number</label>
                <input
                  required
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="w-full bg-black border border-zinc-800 rounded-md p-2 focus:ring-2 focus:ring-[#9505F7] outline-none"
                  placeholder="e.g. 2021CS001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded-md p-2 focus:ring-2 focus:ring-[#9505F7] outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Department</label>
                  <input
                    required
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded-md p-2 focus:ring-2 focus:ring-[#9505F7] outline-none"
                    placeholder="e.g. CSE"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={nextStep}
                className="w-full py-3 bg-[#9505F7] hover:bg-[#7a04cc] rounded-md font-medium transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-semibold">Contact & Preferences</h2>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Phone Number</label>
                <input
                  required
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-black border border-zinc-800 rounded-md p-2 focus:ring-2 focus:ring-[#9505F7] outline-none"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="flex items-center space-x-3 p-4 bg-black/40 rounded-lg border border-zinc-800">
                <input
                  type="checkbox"
                  id="teamBuilding"
                  name="teamBuildingProgram"
                  checked={formData.teamBuildingProgram}
                  onChange={handleChange}
                  className="w-5 h-5 accent-[#9505F7]"
                />
                <label htmlFor="teamBuilding" className="text-sm">
                  Interested in Team Building Program?
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 py-3 border border-zinc-800 hover:bg-zinc-800 rounded-md font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-1/2 py-3 bg-[#9505F7] hover:bg-[#7a04cc] rounded-md font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-semibold">Agreements</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-black/40 rounded-lg border border-zinc-800">
                  <input
                    required
                    type="checkbox"
                    id="conduct"
                    name="readCodeOfConduct"
                    checked={formData.readCodeOfConduct}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#9505F7]"
                  />
                  <label htmlFor="conduct" className="text-sm">
                    I have read and agree to the Code of Conduct
                  </label>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-black/40 rounded-lg border border-zinc-800">
                  <input
                    required
                    type="checkbox"
                    id="discord"
                    name="joinedDiscord"
                    checked={formData.joinedDiscord}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#9505F7]"
                  />
                  <label htmlFor="discord" className="text-sm">
                    I have joined the official Discord server
                  </label>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                  {error}
                </p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 py-3 border border-zinc-800 hover:bg-zinc-800 rounded-md font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-3 bg-[#9505F7] hover:bg-[#7a04cc] rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Complete Profile"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
