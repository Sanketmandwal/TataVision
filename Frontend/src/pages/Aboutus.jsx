import React, { useState } from 'react';
import { Award, Sparkles, Brain, Code, Database, Target, Heart, Zap, Users, Trophy, Rocket } from 'lucide-react';

// Helper function to get initials from a name
const getInitials = (name = '') => {
  if (!name || typeof name !== 'string') return '?';
  const names = name.trim().split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return `${names[0][0]}`.toUpperCase();
};


const AboutUs = () => {
  const teamMembers = [
    {
      name: "Sanket Mandwal",
      role: "Team Lead & Full Stack Developer",
      bio: "Visionary leader with a passion for building scalable, AI-driven analytics platforms from the ground up.",
      color: "from-blue-500 to-cyan-500",
      icon: Target,
      skills: ["Leadership", "React", "Node.js", "System Design"],
    },
    {
      name: "Patel Abdul Rahman Khan",
      role: "AI/ML Engineer",
      bio: "Expert in natural language processing, specializing in fine-tuning transformer models for sentiment analysis.",
      color: "from-purple-500 to-pink-500",
      icon: Brain,
      skills: ["Python", "PyTorch", "NLP", "Hugging Face"],
    },
    {
      name: "Abrar Chavhan",
      role: "Backend & DevOps Engineer",
      bio: "Architecture expert focused on building robust data pipelines and ensuring seamless, scalable deployments.",
      color: "from-orange-500 to-red-500",
      icon: Code,
      skills: ["Python", "FastAPI", "AWS", "Docker", "Kubernetes"],
    },
    {
      name: "Atharva Kulthe",
      role: "Data Scientist & Analyst",
      bio: "Analytics wizard skilled at discovering hidden patterns and turning raw data into actionable business intelligence.",
      color: "from-emerald-500 to-teal-500",
      icon: Database,
      skills: ["SQL", "Pandas", "Analytics", "Tableau"],
    },
  ];

  const stats = [
    { icon: Users, value: "4", label: "Core Members", color: "text-blue-500" },
    { icon: Trophy, value: "2+", label: "Hackathons Won", color: "text-purple-500" },
    { icon: Rocket, value: "100%", label: "Project Dedication", color: "text-emerald-500" },
    { icon: Award, value: "2", label: "Best Innovation Awards", color: "text-orange-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden pt-24">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-12 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-400/20 mb-8 animate-fade-in">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Meet the Dream Team</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Innovators Behind the
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Magic</span>
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-8">
              We're a passionate team of developers, designers, and data scientists united by one mission: transforming social media sentiment into actionable sales strategies for Tata Motors.
            </p>

            <div className="flex items-center justify-center gap-3">
              <Heart className="w-6 h-6 text-red-400 animate-pulse" />
              <span className="text-slate-400">Built with passion and dedication</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:transform hover:-translate-y-2 group"
              >
                <stat.icon className={`w-10 h-10 ${stat.color} mb-4 group-hover:scale-110 transition-transform`} />
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Grid */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-500 hover:transform hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-500/20">
                  {/* Avatar Placeholder Section */}
                  <div className={`relative h-60 flex items-center justify-center bg-gradient-to-br ${member.color} overflow-hidden`}>
                     <div className="absolute inset-0 bg-slate-900/50"></div>
                     <span className="text-6xl font-bold text-white opacity-80 z-10">{getInitials(member.name)}</span>
                     <div className={`absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg group-hover:rotate-12 transition-transform`}>
                        <member.icon className="w-6 h-6 text-white" />
                      </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                    <div className={`inline-block bg-gradient-to-r ${member.color} bg-clip-text text-transparent font-semibold mb-3`}>
                      {member.role}
                    </div>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed h-20">{member.bio}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300 border border-white/10 hover:border-white/20 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center">
            <Rocket className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              To revolutionize how Tata Motors understands customer sentiment by building intelligent, data-driven solutions that transform social media insights into measurable sales growth and enhanced customer satisfaction.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 bg-white/5 rounded-full border border-white/10">
                <span className="text-slate-300">🎯 Innovation First</span>
              </div>
              <div className="px-6 py-3 bg-white/5 rounded-full border border-white/10">
                <span className="text-slate-300">💡 Data-Driven</span>
              </div>
              <div className="px-6 py-3 bg-white/5 rounded-full border border-white/10">
                <span className="text-slate-300">🚀 Customer Focused</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="container mx-auto px-4 pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Want to Join Our Journey?</h2>
            <p className="text-slate-400 mb-8">We're always looking for talented individuals who share our passion</p>
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-1 transition-all">
              Get In Touch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
