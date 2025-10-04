import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, TrendingUp, Target, Users, Zap, MessageSquare, BarChart3, Shield, ChevronRight, Play, Gauge, Map, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Spline from '@splinetool/react-spline';
import { useNavigate } from 'react-router';
import usercontext from '../context/usercontext';

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { token } = React.useContext(usercontext);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Competitor Gap Analysis",
      description: "Track competitor mentions, sentiment trends, and customer feedback in real-time to identify opportunities and gaps.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Brain,
      title: "Sentiment Insights",
      description: "Analyze customer opinions and sentiment patterns across social platforms to understand perceptions and preferences.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Gauge,
      title: "Dealer Dashboard",
      description: "Empower local dealers with region-specific sentiment trends, customer feedback, and actionable insights.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Map,
      title: "Sales Executive Intelligence",
      description: "Equip your sales team with live insights about customer sentiment, market trends, and engagement opportunities.",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const usps = [
    {
      icon: Target,
      title: "Actionable Insights",
      description: "Turn social sentiment data into clear strategies for sales and marketing."
    },
    {
      icon: TrendingUp,
      title: "Competitor Tracking",
      description: "Monitor competitor feedback and market perception instantly."
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description: "Dashboards for dealers, sales execs, and HQ teams for better collaboration."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
        <div className="absolute top-1/4 -right-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 z-10">
              <Badge className="bg-blue-600/10 text-blue-400 border-blue-500/20 hover:border-blue-400/40 transition-colors backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Social Sentiment Analysis Platform
              </Badge>

              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                  <span className="text-white">Understand Your Market.</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Make Data-Driven Decisions.
                  </span>
                </h1>

                <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                  Gain actionable insights from social media and customer feedback. Identify trends, monitor competitor sentiment, and optimize your sales strategy with real-time analytics.
                </p>
              </div>

              {/* USP Pills */}
              <div className="flex flex-wrap gap-3">
                {usps.map((usp, index) => {
                  const Icon = usp.icon;
                  return (
                    <div key={index} className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all backdrop-blur-sm group cursor-pointer">
                      <Icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-slate-300 font-medium">{usp.title}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button onClick={()=>{navigate('/chatbot')}} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all group">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" className="border-2 border-slate-700 hover:border-blue-500/50 hover:text-white text-lg px-8 py-6 rounded-xl bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800/80 group">
                  See It In Action
                  <Play className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Right - 3D Spline Model */}
            <div className="relative lg:h-[700px] h-[500px] -mr-4 sm:-mr-6 lg:-mr-8">
              <div className="w-full h-screen">
                <Spline scene="https://prod.spline.design/5csdpmzCk9Gz4Hy6/scene.splinecode" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <Badge className="bg-purple-600/10 text-purple-400 border-purple-500/20 backdrop-blur-sm">
              Platform Capabilities
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold">
              <span className="text-white">Transform</span>{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Social Insights
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Four key capabilities to monitor, analyze, and act on customer sentiment in real-time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="relative bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-slate-700 transition-all duration-500 p-8 group cursor-pointer overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                    <div className="flex items-center mt-6 text-blue-400 font-medium group-hover:translate-x-2 transition-transform">
                      Learn more
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA4IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

            <div className="relative z-10 px-8 sm:px-16 py-20 text-center space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                <Zap className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Understand Your Market.
                <br />
                <span className="text-white/90">Act on Customer Sentiment.</span>
              </h2>

              <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Turn social sentiment into actionable insights. Monitor trends, engage customers, and make data-driven decisions that drive growth.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button className="bg-white text-purple-600 hover:bg-slate-100 text-lg px-10 py-6 rounded-xl font-semibold shadow-2xl hover:scale-105 transition-all">
                  Request Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" className="border-2 border-white/30 hover:border-white text-white text-lg px-10 py-6 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10">
                  Talk to Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
