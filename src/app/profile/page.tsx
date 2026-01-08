'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Camera,
  CreditCard,
  Edit2,
  Globe,
  Lock,
  MapPin,
  Save,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function Profile() {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.emailAddresses?.[0]?.emailAddress || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: 'Auckland, New Zealand',
    dateOfBirth: '1990-05-15',
    nationality: 'New Zealand',
    passportNumber: 'NZ123456789',
    passportExpiry: '2030-05-15',
  });

  const [preferences, setPreferences] = useState({
    currency: 'USD',
    language: 'English',
    travelClass: 'Economy',
    seatPreference: 'Window',
    mealPreference: 'None',
    interests: ['Beach', 'Adventure', 'Culture', 'Food'],
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    smsAlerts: false,
    priceAlerts: true,
    promotions: true,
    tripReminders: true,
    newsletter: true,
  });

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleSavePreferences = () => {
    toast.success('Preferences saved!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification settings updated!');
  };

  const handleAvatarChange = () => {
    toast.success('Profile photo updated!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-12">
      <div className="mx-auto max-w-6xl px-[0px] pt-[100px] pb-[82px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Profile & Settings
          </h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={user?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'}
                      alt="Profile"
                    />
                    <AvatarFallback className="text-2xl">
                      {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute right-0 bottom-0 h-10 w-10 rounded-full p-0"
                    onClick={handleAvatarChange}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="mb-2 text-gray-600">{profileData.email}</p>
                  <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {profileData.address}
                    </Badge>
                    <Badge variant="secondary">Member since 2024</Badge>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Gold Member
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="personal" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Payment</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and travel documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            dateOfBirth: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={profileData.nationality}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            nationality: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <Separator />

                  <h3 className="font-semibold text-gray-900">
                    Travel Documents
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="passport">Passport Number</Label>
                      <Input
                        id="passport"
                        value={profileData.passportNumber}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            passportNumber: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passportExpiry">Passport Expiry</Label>
                      <Input
                        id="passportExpiry"
                        type="date"
                        value={profileData.passportExpiry}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            passportExpiry: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <Button onClick={handleSaveProfile} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Travel Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Travel Preferences</CardTitle>
                  <CardDescription>
                    Customize your travel experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Preferred Currency</Label>
                      <Select
                        value={preferences.currency}
                        onValueChange={(value) =>
                          setPreferences({
                            ...preferences,
                            currency: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">
                            GBP - British Pound
                          </SelectItem>
                          <SelectItem value="NZD">
                            NZD - New Zealand Dollar
                          </SelectItem>
                          <SelectItem value="AUD">
                            AUD - Australian Dollar
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={preferences.language}
                        onValueChange={(value) =>
                          setPreferences({
                            ...preferences,
                            language: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Japanese">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <h3 className="font-semibold text-gray-900">
                    Flight Preferences
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="travelClass">
                        Preferred Travel Class
                      </Label>
                      <Select
                        value={preferences.travelClass}
                        onValueChange={(value) =>
                          setPreferences({
                            ...preferences,
                            travelClass: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Economy">Economy</SelectItem>
                          <SelectItem value="Premium Economy">
                            Premium Economy
                          </SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="First Class">
                            First Class
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seat">Seat Preference</Label>
                      <Select
                        value={preferences.seatPreference}
                        onValueChange={(value) =>
                          setPreferences({
                            ...preferences,
                            seatPreference: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Window">Window</SelectItem>
                          <SelectItem value="Aisle">Aisle</SelectItem>
                          <SelectItem value="Middle">Middle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meal">Meal Preference</Label>
                    <Select
                      value={preferences.mealPreference}
                      onValueChange={(value) =>
                        setPreferences({
                          ...preferences,
                          mealPreference: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">No Preference</SelectItem>
                        <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="Vegan">Vegan</SelectItem>
                        <SelectItem value="Halal">Halal</SelectItem>
                        <SelectItem value="Kosher">Kosher</SelectItem>
                        <SelectItem value="Gluten-free">Gluten-free</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block">Travel Interests</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Beach',
                        'Adventure',
                        'Culture',
                        'Food',
                        'Shopping',
                        'Nature',
                        'History',
                        'Nightlife',
                      ].map((interest) => (
                        <Badge
                          key={interest}
                          variant={
                            preferences.interests.includes(interest)
                              ? 'default'
                              : 'outline'
                          }
                          className="cursor-pointer"
                          onClick={() => {
                            setPreferences({
                              ...preferences,
                              interests: preferences.interests.includes(
                                interest
                              )
                                ? preferences.interests.filter(
                                    (i) => i !== interest
                                  )
                                : [...preferences.interests, interest],
                            });
                          }}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleSavePreferences} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how you receive updates from Weave
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Updates</Label>
                        <p className="text-sm text-gray-500">
                          Receive booking confirmations and updates via email
                        </p>
                      </div>
                      <Switch
                        checked={notifications.emailUpdates}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            emailUpdates: checked,
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Alerts</Label>
                        <p className="text-sm text-gray-500">
                          Get important alerts via text message
                        </p>
                      </div>
                      <Switch
                        checked={notifications.smsAlerts}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            smsAlerts: checked,
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Price Alerts</Label>
                        <p className="text-sm text-gray-500">
                          Notify me when prices drop on saved items
                        </p>
                      </div>
                      <Switch
                        checked={notifications.priceAlerts}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            priceAlerts: checked,
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Promotional Offers</Label>
                        <p className="text-sm text-gray-500">
                          Receive exclusive deals and special offers
                        </p>
                      </div>
                      <Switch
                        checked={notifications.promotions}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            promotions: checked,
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Trip Reminders</Label>
                        <p className="text-sm text-gray-500">
                          Get reminders about upcoming trips
                        </p>
                      </div>
                      <Switch
                        checked={notifications.tripReminders}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            tripReminders: checked,
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Newsletter</Label>
                        <p className="text-sm text-gray-500">
                          Monthly travel inspiration and tips
                        </p>
                      </div>
                      <Switch
                        checked={notifications.newsletter}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            newsletter: checked,
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveNotifications} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Methods Tab */}
            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your saved payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Saved Cards */}
                  <div className="space-y-4">
                    <Card className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-8 w-12 items-center justify-center rounded bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-bold text-white">
                              VISA
                            </div>
                            <div>
                              <p className="font-medium">•••• •••• •••• 4242</p>
                              <p className="text-sm text-gray-600">
                                Expires 12/2027
                              </p>
                              <Badge className="mt-2" variant="secondary">
                                Default
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-8 w-12 items-center justify-center rounded bg-gradient-to-r from-red-600 to-orange-600 text-xs font-bold text-white">
                              MC
                            </div>
                            <div>
                              <p className="font-medium">•••• •••• •••• 8888</p>
                              <p className="text-sm text-gray-600">
                                Expires 09/2026
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Button variant="outline" className="w-full gap-2">
                    <CreditCard className="h-4 w-4" />
                    Add New Payment Method
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <Button className="gap-2">
                    <Lock className="h-4 w-4" />
                    Update Password
                  </Button>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Login Alerts</Label>
                        <p className="text-sm text-gray-500">
                          Get notified of new login attempts
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-3 font-semibold text-gray-900">
                      Active Sessions
                    </h3>
                    <div className="space-y-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">Chrome on Windows</p>
                              <p className="text-sm text-gray-500">
                                Auckland, New Zealand • Active now
                              </p>
                            </div>
                            <Badge className="bg-green-500">Current</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">Safari on iPhone</p>
                              <p className="text-sm text-gray-500">
                                Auckland, New Zealand • 2 hours ago
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Revoke
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}