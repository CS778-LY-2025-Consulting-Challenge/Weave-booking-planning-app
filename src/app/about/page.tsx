import { Card, CardContent } from '@/components/ui/card';
import { Award, Heart, Plane, Users } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: Users, label: 'Happy Travelers', value: '50,000+' },
    { icon: Plane, label: 'Destinations', value: '150+' },
    { icon: Award, label: 'Awards Won', value: '25+' },
    { icon: Heart, label: 'Five-Star Reviews', value: '10,000+' },
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1551727095-10465ee6b17f?w=400',
    },
    {
      name: 'Michael Chen',
      role: 'Head of Technology',
      image:
        'https://images.unsplash.com/photo-1591194233688-dca69d406068?w=400',
    },
    {
      name: 'Emma Rodriguez',
      role: 'Travel Experience Director',
      image:
        'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400',
    },
    {
      name: 'David Park',
      role: 'Customer Success Lead',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400',
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-white">About Weave</h1>
          <p className="mx-auto max-w-3xl text-xl text-white/90">
            We're on a mission to make travel planning effortless and inspire
            people to explore the world with confidence.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center">Our Story</h2>
          <div className="space-y-6 text-gray-600">
            <p>
              Weave was born from a simple observation: planning a trip
              shouldn't be overwhelming. In 2020, our founder Sarah Johnson
              spent countless hours trying to plan a family vacation, juggling
              multiple websites, spreadsheets, and conflicting advice from
              travel forums.
            </p>
            <p>
              She thought, "There has to be a better way." That spark of
              frustration became the inspiration for Weave—a platform that
              brings together everything you need to plan, book, and experience
              incredible journeys, all in one place.
            </p>
            <p>
              Today, we're a team of travel enthusiasts, technologists, and
              dreamers working together to make travel accessible, affordable,
              and unforgettable for everyone. We believe that the world is meant
              to be explored, and we're here to help you do just that.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center">By the Numbers</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                    <stat.icon className="size-8 text-white" />
                  </div>
                  <p className="mb-2 text-3xl">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center">Our Mission & Values</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Plane className="size-6 text-blue-600" />
                </div>
                <h3 className="mb-4 text-xl">Simplicity</h3>
                <p className="text-gray-600">
                  We believe travel planning should be simple and intuitive, not
                  a puzzle to solve.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Heart className="size-6 text-purple-600" />
                </div>
                <h3 className="mb-4 text-xl">Community</h3>
                <p className="text-gray-600">
                  Real travelers sharing real experiences to inspire and help
                  each other explore.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Award className="size-6 text-green-600" />
                </div>
                <h3 className="mb-4 text-xl">Excellence</h3>
                <p className="text-gray-600">
                  From our technology to our customer service, we strive for
                  excellence in everything.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mb-1 text-lg">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}