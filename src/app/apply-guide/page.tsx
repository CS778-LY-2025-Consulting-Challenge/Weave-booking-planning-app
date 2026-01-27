'use client';

import { useState } from 'react';
import { addGuideProfile } from '@/lib/guides';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MapPin,
  User,
  Mail,
  Phone,
  Globe,
  Languages,
  Award,
  FileText,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ApplyGuide() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    
    // Professional Details
    languages: [] as string[],
    yearsOfExperience: '',
    certifications: '',
    
    // About
    bio: '',
    specialties: '',
    whyGuide: '',
    
    // Agreement
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: false });
  };

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};

    if (!formData.fullName.trim()) newErrors.fullName = true;
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = true;
    if (!formData.phone.trim()) newErrors.phone = true;
    if (!formData.country.trim()) newErrors.country = true;
    if (!formData.city.trim()) newErrors.city = true;
    if (formData.languages.length === 0) newErrors.languages = true;
    if (!formData.yearsOfExperience) newErrors.yearsOfExperience = true;
    if (!formData.bio.trim() || formData.bio.length < 100) newErrors.bio = true;
    if (!formData.specialties.trim()) newErrors.specialties = true;
    if (!formData.whyGuide.trim()) newErrors.whyGuide = true;
    if (!formData.agreedToTerms) newErrors.agreedToTerms = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);
    try {
      await addGuideProfile({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        languages: formData.languages,
        yearsOfExperience: formData.yearsOfExperience,
        certifications: formData.certifications,
        bio: formData.bio,
        specialties: formData.specialties,
        whyGuide: formData.whyGuide,
        createdAt: new Date().toISOString(),
        status: 'pending',
      });
      setStep('success');
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit application. Please try again.');
    }
    setIsSubmitting(false);
  };

  const languageOptions = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Mandarin',
    'Japanese',
    'Korean',
    'Arabic',
    'Russian',
    'Hindi',
  ];

  const handleLanguageToggle = (language: string) => {
    const newLanguages = formData.languages.includes(language)
      ? formData.languages.filter((l) => l !== language)
      : [...formData.languages, language];
    handleInputChange('languages', newLanguages);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Application Submitted! 🎉
            </h1>

            <p className="text-lg text-gray-600 mb-6">
              Thank you for your interest in becoming a Weave Travel Guide!
            </p>

            <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Our team will review your application within 2-3 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>You'll receive an email at <strong>{formData.email}</strong> with next steps</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>If approved, we'll schedule a video interview to discuss your experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Once verified, you'll get access to your guide dashboard</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                size="lg"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => router.push('/guides')}
                size="lg"
              >
                Explore Guides
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Become a Weave Travel Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your local expertise and passion for travel. Connect with travelers
            from around the world and create unforgettable experiences.
          </p>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-blue-100 p-2">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">Full name is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">Valid email is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">Phone number is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="country"
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && (
                  <p className="text-xs text-red-500 mt-1">Country is required</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-xs text-red-500 mt-1">City is required</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-purple-100 p-2">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Professional Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label>
                  Languages Spoken <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {languageOptions.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={language}
                        checked={formData.languages.includes(language)}
                        onCheckedChange={() => handleLanguageToggle(language)}
                      />
                      <label
                        htmlFor={language}
                        className="text-sm cursor-pointer select-none"
                      >
                        {language}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.languages && (
                  <p className="text-xs text-red-500 mt-2">Select at least one language</p>
                )}
              </div>

              <div>
                <Label htmlFor="yearsOfExperience">
                  Years of Experience as a Guide <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.yearsOfExperience}
                  onValueChange={(value) => handleInputChange('yearsOfExperience', value)}
                >
                  <SelectTrigger className={errors.yearsOfExperience ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">Less than 1 year</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
                {errors.yearsOfExperience && (
                  <p className="text-xs text-red-500 mt-1">Experience level is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="certifications">
                  Certifications or Licenses (Optional)
                </Label>
                <Textarea
                  id="certifications"
                  placeholder="e.g., Licensed Tour Guide, First Aid Certified, Food Safety Certificate"
                  value={formData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* About You */}
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-green-100 p-2">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">About You</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="bio">
                  Your Bio <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Tell us about yourself and your passion for travel (minimum 100 characters)
                </p>
                <Textarea
                  id="bio"
                  placeholder="I'm a passionate local guide with deep knowledge of..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={5}
                  className={errors.bio ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/100 characters
                </p>
                {errors.bio && (
                  <p className="text-xs text-red-500 mt-1">
                    Bio must be at least 100 characters
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="specialties">
                  Your Specialties <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  What makes you unique? (e.g., food tours, historical sites, adventure activities)
                </p>
                <Textarea
                  id="specialties"
                  placeholder="Food & Culinary Tours, Historical Architecture, Local Markets..."
                  value={formData.specialties}
                  onChange={(e) => handleInputChange('specialties', e.target.value)}
                  rows={3}
                  className={errors.specialties ? 'border-red-500' : ''}
                />
                {errors.specialties && (
                  <p className="text-xs text-red-500 mt-1">Specialties are required</p>
                )}
              </div>

              <div>
                <Label htmlFor="whyGuide">
                  Why do you want to be a guide? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="whyGuide"
                  placeholder="I want to share my love for my city and..."
                  value={formData.whyGuide}
                  onChange={(e) => handleInputChange('whyGuide', e.target.value)}
                  rows={4}
                  className={errors.whyGuide ? 'border-red-500' : ''}
                />
                {errors.whyGuide && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms & Submit */}
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            <div className="flex items-start space-x-3 mb-6">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) =>
                  handleInputChange('agreedToTerms', checked)
                }
                className={errors.agreedToTerms ? 'border-red-500' : ''}
              />
              <div className="flex-1">
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-700 cursor-pointer select-none"
                >
                  I agree to Weave's{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  . I understand that my application will be reviewed and I'll be contacted
                  within 2-3 business days.
                </label>
                {errors.agreedToTerms && (
                  <p className="text-xs text-red-500 mt-1">
                    You must agree to the terms to continue
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
